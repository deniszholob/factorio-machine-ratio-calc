import { Production } from 'src/app/components/production-chain-editor/production-editor/production.model';

export interface ProductionTreeRow {
  production: Production;
  depth: number;
  hasChildren: boolean;
  childCount: number;
}

export interface ProductionMoveEvent {
  machineId: string;
  beforeMachineId?: string;
  parentProductionId?: string;
}

export interface ProductionMovePreview extends ProductionMoveEvent {
  mode: 'into-parent' | 'outside-parent' | 'reorder';
}

/** Builds a tree-flattened visible list from a flat parent-linked collection. */
export function buildVisibleRows(machines: Production[]): ProductionTreeRow[] {
  if (machines.length === 0) {
    return [];
  }

  const byId = new Map<string, Production>();
  const childrenByParent = new Map<string, Production[]>();
  const roots: Production[] = [];

  for (const machine of machines) {
    byId.set(machine.id, machine);
  }

  for (const machine of machines) {
    const parentId = machine.parentProductionId;
    if (!parentId || !byId.has(parentId) || parentId === machine.id) {
      roots.push(machine);
      continue;
    }

    const existing = childrenByParent.get(parentId) ?? [];
    existing.push(machine);
    childrenByParent.set(parentId, existing);
  }

  const rows: ProductionTreeRow[] = [];
  const visited = new Set<string>();

  const appendRows = (
    nodes: Production[],
    depth: number,
    ancestors: Set<string>,
  ): void => {
    for (const node of nodes) {
      if (ancestors.has(node.id) || visited.has(node.id)) {
        continue;
      }
      visited.add(node.id);
      const children = childrenByParent.get(node.id) ?? [];
      rows.push({
        production: node,
        depth,
        hasChildren: children.length > 0,
        childCount: children.length,
      });

      if (children.length > 0 && node.isExpanded !== false) {
        appendRows(children, depth + 1, new Set([...ancestors, node.id]));
      }
    }
  };

  appendRows(roots, 0, new Set<string>());

  return rows;
}

/**
 * Finds the parent id for a given target depth using the nearest previous row
 * that sits exactly one level above the target depth.
 */
export function findParentIdForDepth(
  rows: ProductionTreeRow[],
  index: number,
  depth: number,
): string | undefined {
  if (depth <= 0) {
    return undefined;
  }
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const row = rows[cursor];
    if (!row) {
      continue;
    }
    if (row.depth === depth - 1) {
      return row.production.id;
    }
  }
  return undefined;
}

/**
 * Builds the current drag placement preview:
 * - vertical movement => insertion index
 * - horizontal movement => depth adjustment (nest/outdent)
 */
export function buildDragPreview(
  rows: ProductionTreeRow[],
  machines: Production[],
  draggedMachineId: string | undefined,
  currentIndex: number | undefined,
  distanceX: number,
): ProductionMovePreview | undefined {
  if (!draggedMachineId) {
    return undefined;
  }

  const sourceRow = rows.find((row) => row.production.id === draggedMachineId);
  if (!sourceRow) {
    return undefined;
  }

  const subtreeIds = collectSubtreeIds(machines, draggedMachineId);
  const rowsWithoutSubtree = rows.filter(
    (row) => !subtreeIds.has(row.production.id),
  );
  const originalIndex =
    currentIndex ??
    rows.findIndex((row) => row.production.id === draggedMachineId);
  const insertionIndex = getAdjustedInsertionIndex(
    originalIndex,
    rows,
    subtreeIds,
  );
  const nextIndex = clamp(insertionIndex, 0, rowsWithoutSubtree.length);
  const beforeRow = rowsWithoutSubtree[nextIndex];
  const previousRow = rowsWithoutSubtree[nextIndex - 1];
  const maxDepth = previousRow ? previousRow.depth + 1 : 0;
  const depthShift = Math.round(distanceX / 24);
  const nextDepth = clamp(sourceRow.depth + depthShift, 0, maxDepth);
  const parentProductionId = findParentIdForDepth(
    rowsWithoutSubtree,
    nextIndex,
    nextDepth,
  );

  let mode: ProductionMovePreview['mode'] = 'reorder';
  if (nextDepth > sourceRow.depth) {
    mode = 'into-parent';
  } else if (nextDepth < sourceRow.depth) {
    mode = 'outside-parent';
  }

  return {
    machineId: draggedMachineId,
    beforeMachineId: beforeRow?.production.id,
    parentProductionId,
    mode,
  };
}

/**
 * Converts a source index from the full row list into an insertion index in a
 * filtered list where dragged subtree rows are removed.
 */
export function getAdjustedInsertionIndex(
  originalIndex: number,
  rows: ProductionTreeRow[],
  removedIds: Set<string>,
): number {
  const boundedOriginal = clamp(originalIndex, 0, rows.length);
  let adjustedIndex = 0;
  for (let index = 0; index < rows.length; index += 1) {
    if (index >= boundedOriginal) {
      break;
    }
    if (removedIds.has(rows[index]?.production.id ?? '')) {
      continue;
    }
    adjustedIndex += 1;
  }
  return adjustedIndex;
}

/** Collects ids for root + all descendants from parent links. */
export function collectSubtreeIds(
  productions: Production[],
  rootMachineId: string,
): Set<string> {
  const childrenByParent = buildChildrenByParent(productions);

  const ids = new Set<string>();
  const stack: string[] = [rootMachineId];
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId || ids.has(currentId)) {
      continue;
    }
    ids.add(currentId);
    const children = childrenByParent.get(currentId) ?? [];
    for (const childId of children) {
      stack.push(childId);
    }
  }
  return ids;
}

/**
 * Returns subtree productions in deterministic DFS order, ensuring the moved
 * block preserves parent-before-child ordering after insertion.
 */
export function collectSubtreeItemsInOrder(
  productions: Production[],
  rootMachineId: string,
): Production[] {
  const byId = new Map(
    productions.map((production) => [production.id, production]),
  );
  const childrenByParent = buildChildrenByParent(productions);
  const ordered: Production[] = [];
  const visited = new Set<string>();

  const append = (id: string): void => {
    if (visited.has(id)) {
      return;
    }
    visited.add(id);
    const production = byId.get(id);
    if (!production) {
      return;
    }

    ordered.push(production);
    const children = childrenByParent.get(id) ?? [];
    for (const childId of children) {
      append(childId);
    }
  };

  append(rootMachineId);
  return ordered;
}

/** Builds a parent->children adjacency list from flat productions. */
export function buildChildrenByParent(
  productions: Production[],
): Map<string, string[]> {
  const childrenByParent = new Map<string, string[]>();
  for (const production of productions) {
    const parentId = production.parentProductionId;
    if (!parentId) {
      continue;
    }
    const children = childrenByParent.get(parentId) ?? [];
    children.push(production.id);
    childrenByParent.set(parentId, children);
  }
  return childrenByParent;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
