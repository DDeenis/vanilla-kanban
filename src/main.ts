import "./style.css";
import { DragDropManager, KeyboardSensor, PointerSensor } from "@dnd-kit/dom";
import { RestrictToWindow } from "@dnd-kit/dom/modifiers";
import { Sortable } from "@dnd-kit/dom/sortable";

type Card = {
  id: string;
  boardId: string;
  name: string;
  columnId: string;
};

type ColumnWithCards = {
  id: string;
  boardId: string;
  name: string;
  color: string;
  cards: Card[];
};

type Column = Omit<ColumnWithCards, "cards">;

type DndEventData = { column: Column } | { card: Card };

function uuid() {
  return crypto.randomUUID();
}

const initialColumns: ColumnWithCards[] = Array.from({ length: 10 }).map(
  (_, i) => {
    const columnId = uuid();
    return {
      id: columnId,
      boardId: "1",
      color: `#${i}${i}${i}`,
      name: `Column ${i + 1}`,
      cards: Array.from({ length: 50 }).map(
        (_, j) =>
          ({
            id: uuid(),
            columnId,
            boardId: "1",
            name: `Card ${j + 1}`,
          } satisfies Card)
      ),
    } satisfies ColumnWithCards;
  }
);

function createCard({
  card,
  index,
  manager,
}: {
  card: Card;
  index: number;
  manager: DragDropManager;
}) {
  const cardElem = document.createElement("li");
  cardElem.className =
    "mb-2 mr-2 line-clamp-3 rounded-md border border-transparent bg-slate-700 p-2 text-white";
  cardElem.textContent = card.name;

  new Sortable(
    {
      id: card.id,
      element: cardElem,
      index: index,
      type: "card",
      accept: "card",
      group: "board",
      data: {
        card,
      } as DndEventData,
    },
    manager
  );

  return cardElem;
}

let globalCardIndex = 0;
function createColumn({
  column,
  index,
  manager,
}: {
  column: ColumnWithCards;
  index: number;
  manager: DragDropManager;
}) {
  const columnElem = document.createElement("div");
  columnElem.className =
    "mr-4 flex h-max max-h-full w-[272px] flex-none flex-col overflow-hidden rounded-md bg-slate-800 p-2";

  const dragHandle = document.createElement("div");
  dragHandle.className =
    "drag-handle cursor-grab p-2 text-white active:cursor-grabbing";
  dragHandle.textContent = column.name;

  const cardsContainer = document.createElement("ul");
  cardsContainer.className =
    "h-max max-h-full overflow-y-scroll overflow-x-hidden board-scrollbar-vertical";

  for (const card of column.cards) {
    cardsContainer.appendChild(
      createCard({ card, index: globalCardIndex++, manager })
    );
  }

  const emplyListPlaceholder = document.createElement("li");
  emplyListPlaceholder.className =
    "rounded-md border border-dashed border-gray-500 p-2 text-center text-gray-400 hidden only-of-type:block";
  emplyListPlaceholder.textContent = "Drag card here";
  cardsContainer.appendChild(emplyListPlaceholder);

  const addCardBtn = document.createElement("button");
  addCardBtn.className = "p-2 text-white";
  addCardBtn.textContent = "Add card";

  columnElem.append(dragHandle, cardsContainer, addCardBtn);

  new Sortable(
    {
      id: column.id,
      element: columnElem,
      handle: dragHandle,
      index,
      type: "column",
      accept: ["column", "card"],
      data: {
        column,
      } as DndEventData,
    },
    manager
  );

  return columnElem;
}

function setupBoard(columns: ColumnWithCards[]) {
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  const boardContainer = document.createElement("div");
  boardContainer.className =
    "inline-flex gap-4 w-screen h-screen p-4 overflow-x-auto overflow-y-hidden board-scrollbar-horizontal";

  const dndManager = new DragDropManager({
    modifiers: [RestrictToWindow],
    sensors: [PointerSensor, KeyboardSensor],
  });

  let columnIndex = 0;
  for (const column of columns) {
    boardContainer.appendChild(
      createColumn({ column, index: columnIndex++, manager: dndManager })
    );
  }

  appContainer.appendChild(boardContainer);
}

setupBoard(initialColumns);
