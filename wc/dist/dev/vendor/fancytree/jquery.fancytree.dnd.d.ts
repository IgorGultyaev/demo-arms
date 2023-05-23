declare namespace Fancytree {
	interface DndEventData extends Fancytree.EventData {
		otherNode: FancytreeNode;
		draggable: JQuery;
		hitMode?: "after" | "before" | "over";
	}
}