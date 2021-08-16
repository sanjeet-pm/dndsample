import React, { useMemo, useCallback, useState } from "react";
import ReactDOM from "react-dom";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { createEditor, Transforms } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: 8 * 2,
  margin: `0 0 8px 0`,
  background: isDragging ? "lightgreen" : "grey", // change background colour if dragging
  ...draggableStyle // styles we need to apply on draggables
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: 8,
  width: 250
});

const App = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [items, setItems] = useState([
    { id: 0, children: [{ id: 3, text: "first text node..." }] },
    {
      id: 1,
      children: [
        { id: 4, text: "second text node..." },
        { id: 5, text: "third..." }
      ]
    },
    {
      id: 2,
      children: [
        { id: 6, text: "fourth" },
        { id: 7, text: "fifth" },
        { id: 8, text: "sixth" }
      ]
    }
  ]);

  const onDragEnd = useCallback(
    result => {
      const { destination, source } = result;
      // dropped outside the list
      if (!destination) {
        return;
      }
      // if location of drag is original location
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }
      // apply the move to the Slate editor
      Transforms.moveNodes(editor, {
        at: [source.index],
        to: [destination.index]
      });
    },
    [editor]
  );

  const renderLeaf = useCallback(props => {
    return (
      <p {...props.attributes} style={{ border: "1px solid white", margin: 0 }}>
        {props.children}
      </p>
    );
  }, []);

  const renderElement = useCallback(
    ({ element, children }) => {
      const currElemIndex = items.reduce(
        (accum, curr, i) => (element.id === curr.id ? i : accum),
        -1
      );
      return (
        <Draggable
          key={element.id}
          draggableId={element.id.toString()}
          index={currElemIndex}
        >
          {(provided, snapshot) => {
            return (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                style={getItemStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
              >
                <div
                  {...provided.dragHandleProps}
                  contentEditable={false}
                  style={{ backgroundColor: "#aaa", padding: "5px" }}
                >
                  drag handle
                </div>
                {children}
              </div>
            );
          }}
        </Draggable>
      );
    },
    [items]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Slate editor={editor} value={items} onChange={setItems}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Slate>
    </DragDropContext>
  );
};

// Put the thing into the DOM!
ReactDOM.render(<App />, document.getElementById("root"));
