import React, { useRef, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  ContentBlock,
  genKey,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const CustomEditor = () => {
  const editorRef = useRef(null);
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  function saveContent() {
    const contentState = editorState.getCurrentContent();
    console.log(contentState);
    const contentRaw = convertToRaw(contentState);
    localStorage.setItem("editor-content", JSON.stringify(contentRaw));
  }

  useEffect(() => {
    const savedContent = localStorage.getItem("editor-content");
    if (savedContent) {
      const contentRaw = JSON.parse(savedContent);
      const contentState = convertFromRaw(contentRaw);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    if (command === "split-block") {
      const currentContent = editorState.getCurrentContent();
      const currentSelection = editorState.getSelection();

      // Create a new empty block with the same text as the current selection
      const newBlock = new ContentBlock({
        key: genKey(),
        type: "unstyled",
        text: "\n",
        characterList: "",
      });

      // Add the new block after the current selection
      const blockMap = currentContent
        .getBlockMap()
        .set(newBlock.getKey(), newBlock);
      const newContentState = currentContent.merge({
        blockMap,
        selectionAfter: currentSelection.merge({
          anchorKey: newBlock.getKey(),
          focusKey: newBlock.getKey(),
          anchorOffset: 0,
          focusOffset: 0,
        }),
      });

      // Update the editorState with the new content and selection
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "split-block"
      );
      setEditorState(newEditorState);
      return "handled";
    }
    return "not-handled";
  };

  const styleMap = {
    COLOR_RED: {
      color: "red",
    },
  };
  const handleBeforeInput = (input) => {
    if (input === " ") {
      console.log("inside");
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const currentBlock = contentState.getBlockForKey(
        selectionState.getStartKey()
      );

      // Check if currentBlock is defined before using it
      if (!currentBlock) {
        return "handled";
      }

      const currentBlockText = currentBlock.getText();
      const start = selectionState.getStartOffset() - 1;
      const startd = selectionState.getStartOffset() - 2;
      const startt = selectionState.getStartOffset() - 3;
      const end = selectionState.getEndOffset();

      if (currentBlockText.charAt(start) === "#" && start === 0) {
        console.log("got #");
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
          }),
          currentBlockText.slice(2)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(RichUtils.toggleBlockType(newEditorState, "header-one"));
        return "handled";
      }
      if (currentBlockText.charAt(start) === "*" && start === 0) {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
          }),
          currentBlockText.slice(2)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(RichUtils.toggleInlineStyle(newEditorState, "BOLD"));
        return "handled";
      }
      if (
        currentBlockText.charAt(start) === "*" &&
        currentBlockText.charAt(startd) === "*" &&
        start === 1
      ) {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: startd,
            focusOffset: end,
          }),
          currentBlockText.slice(2)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(
          RichUtils.toggleInlineStyle(newEditorState, "COLOR_RED")
        );
        return "handled";
      }
      if (currentBlockText.slice(start, end) === "***") {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
          }),
          ""
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        const contentStateWithUnderline = Modifier.applyInlineStyle(
          newEditorState.getCurrentContent(),
          newEditorState.getSelection(),
          "UNDERLINE"
        );

        const editorStateWithUnderline = EditorState.set(editorState, {
          currentContent: contentStateWithUnderline,
        });

        setEditorState(editorStateWithUnderline);
        return "handled";
      }
      if (currentBlockText.slice(startt, end) === "***") {
        const newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({
            anchorOffset: startt,
            focusOffset: end,
          }),
          currentBlockText.slice(3)
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "remove-range"
        );

        setEditorState(
          RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE")
        );
        return "handled";
      }
    }
  };

  const onChange = (editorState) => {
    setEditorState(editorState);
  };

  return (
    <>
      <h4 className="title">Demo Editor by Kumar Satwik</h4>
      <div id="btn">
        <button onClick={saveContent}>Save</button>
      </div>
      <div className="editorDiv">
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
          placeholder="Write something..."
          ref={editorRef}
        />
      </div>
    </>
  );
};

export default CustomEditor;
