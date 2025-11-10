import React, { useState } from "react";
import type { ModalProps } from "@mantine/core";
import {
  Modal,
  Stack,
  Text,
  ScrollArea,
  Flex,
  CloseButton,
  Button,
  TextInput,
  Group,
} from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import useFile from "../../../store/useFile";
import useJson from "../../../store/useJson";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";

// return object from json preserving nested structures
const normalizeNodeData = (nodeRows: NodeData["text"]) => {
  if (!nodeRows || nodeRows.length === 0) return "{}";
  if (nodeRows.length === 1 && !nodeRows[0].key) return `${nodeRows[0].value}`;

  const obj = {};
  nodeRows?.forEach(row => {
    if (row.key) {
      if (row.type === "array" || row.type === "object") {
        // Preserve nested structures by setting them as-is
        obj[row.key] = row.value;
      } else {
        obj[row.key] = row.value;
      }
    }
  });
  return JSON.stringify(obj, null, 2);
};

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [originalTypes, setOriginalTypes] = useState<Record<string, string>>({});
  const currentJson = useJson(state => state.json);

  const handleStartEdit = () => {
    const normalizedData = JSON.parse(normalizeNodeData(nodeData?.text ?? []));
    // Track original types
    const types = Object.fromEntries(
      Object.entries(normalizedData).map(([key, value]) => [key, typeof value])
    );
    setOriginalTypes(types);
    setEditedValues(
      Object.fromEntries(Object.entries(normalizedData).map(([key, value]) => [key, String(value)]))
    );
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!nodeData?.path) return;

    try {
      // Parse current JSON
      const jsonObj = JSON.parse(currentJson);

      // Navigate to the correct path and update the value
      let current = jsonObj;
      const path = nodeData.path;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      const lastKey = path[path.length - 1];
      if (typeof lastKey === "string" || typeof lastKey === "number") {
        // Get the original node data to preserve nested structures
        const originalData = current[lastKey];

        // Merge edited values with original data, preserving nested structures
        const updatedData = {
          ...originalData,
          ...editedValues,
        };

        // Only update primitive values, preserve nested structures
        Object.entries(editedValues).forEach(([key, value]) => {
          const originalValue = originalData[key];
          if (typeof originalValue !== "object" || originalValue === null) {
            // If the original was a number and the new value is a valid number, convert it
            if (originalTypes[key] === "number" && !isNaN(Number(value))) {
              updatedData[key] = Number(value);
            } else {
              updatedData[key] = value;
            }
          }
        });

        current[lastKey] = updatedData;
      }

      // Update the JSON in all stores and views
      const newJsonString = JSON.stringify(jsonObj, null, 2);

      // Update the file contents (Monaco editor)
      useFile.getState().setContents({ contents: newJsonString });

      // Update JSON store and graph visualization
      useJson.getState().setJson(newJsonString);

      // Force refresh the selected node data
      const graph = useGraph.getState();
      const updatedNode = graph.nodes.find(node => node.id === nodeData.id);
      if (updatedNode) {
        graph.setSelectedNode(updatedNode);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update JSON:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValues({});
    setOriginalTypes({});
  };

  return (
    <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack pb="sm" gap="sm">
        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fz="xs" fw={500}>
              Content
            </Text>
            <Group>
              {!isEditing ? (
                <Button size="xs" onClick={handleStartEdit}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button size="xs" color="red" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="xs" color="green" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
              <CloseButton onClick={onClose} />
            </Group>
          </Flex>
          {!isEditing ? (
            <ScrollArea.Autosize mah={250} maw={600}>
              <CodeHighlight
                code={normalizeNodeData(nodeData?.text ?? [])}
                miw={350}
                maw={600}
                language="json"
                withCopyButton
              />
            </ScrollArea.Autosize>
          ) : (
            <ScrollArea.Autosize mah={250} maw={600}>
              <Stack gap="xs">
                {Object.entries(editedValues).map(([key, value]) => (
                  <TextInput
                    key={key}
                    label={key}
                    value={value}
                    onChange={e =>
                      setEditedValues(prev => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </Stack>
        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={jsonPathToString(nodeData?.path)}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
