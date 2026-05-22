export type ToolType =
    | 'elevate'
    | 'lower'
    | 'smooth'
    | 'points'
    | 'friction';

export class EditorStore {
    activeTool = $state<ToolType>('points');

    startPositionEditMode = $state(false);

    // Terrain point / segment selection
    selectedPointIndex = $state<number | null>(null);
    selectedSegmentIndex = $state<number | null>(null);

    hoveredPointIndex = $state<number | null>(null);
    hoveredSegmentIndex = $state<number | null>(null);

    clearSelection() {
        this.selectedPointIndex = null;
        this.selectedSegmentIndex = null;
    }
}

export const editor = new EditorStore();
