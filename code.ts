// This file holds the main code for the plugin. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).
const nameToTag = (name: string, allowUppercase = false) => {
  const tagName = (name || "")
    .replace(/[^0-9a-zA-Z/-]/g, "")
    .replace(/ /g, "-");
  return !allowUppercase ? tagName.toLowerCase() : tagName;
};

const componentToHTML = ({ name, fills, fillStyleId }: ComponentNode) => {
  const tagname = nameToTag(name);
  const fillStyle = figma.getStyleById(fillStyleId as string);
  const paintStyles = figma.getLocalPaintStyles();
  paintStyles.map(({ name, paints }) => console.log({ name, paints }));
  console.log(fills, fillStyle?.name, fillStyle?.key);
  let html = `<${tagname}></${tagname}>`;
  return html;
};

// Runs this code if the plugin is run in Figma
if (figma.editorType === "figma") {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many rectangles on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage = (msg) => {
    for (const component of figma.root.findAllWithCriteria({
      types: ["COMPONENT"],
    }) || []) {
      console.log(componentToHTML(component));
    }
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === "create-shapes") {
      // figma.currentPage.children.map(
      //   ({
      //     name,
      //     height,
      //     id,
      //     width,
      //     absoluteBoundingBox,
      //     absoluteTransform,
      //     attachedConnectors,
      //     type,
      //     x,
      //     y,
      //     visible,
      //     relativeTransform,
      //     fills,
      //     children,
      //   }: any) =>
      //     console.log({
      //       name,
      //       height,
      //       id,
      //       width,
      //       absoluteBoundingBox,
      //       absoluteTransform,
      //       attachedConnectors,
      //       relativeTransform,
      //       type,
      //       x,
      //       y,
      //       visible,
      //       fills,
      //       children,
      //     })
      // );
      const nodes: SceneNode[] = [];
      for (let i = 0; i < msg.count; i++) {
        const rect = figma.createRectangle();
        rect.x = i * 150;
        rect.fills = [{ type: "SOLID", color: { r: 0, g: 0.5, b: 1 } }];
        figma.currentPage.appendChild(rect);
        nodes.push(rect);
      }
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };

  // If the plugins isn't run in Figma, run this code
} else {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many shapes and connectors on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage = (msg) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === "create-shapes") {
      const numberOfShapes = msg.count;
      const nodes: SceneNode[] = [];
      for (let i = 0; i < numberOfShapes; i++) {
        const shape = figma.createShapeWithText();
        // You can set shapeType to one of: 'SQUARE' | 'ELLIPSE' | 'ROUNDED_RECTANGLE' | 'DIAMOND' | 'TRIANGLE_UP' | 'TRIANGLE_DOWN' | 'PARALLELOGRAM_RIGHT' | 'PARALLELOGRAM_LEFT'
        shape.shapeType = "ROUNDED_RECTANGLE";
        shape.x = i * (shape.width + 200);
        shape.fills = [{ type: "SOLID", color: { r: 0, g: 0.5, b: 1 } }];
        figma.currentPage.appendChild(shape);
        nodes.push(shape);
      }

      for (let i = 0; i < numberOfShapes - 1; i++) {
        const connector = figma.createConnector();
        connector.strokeWeight = 8;

        connector.connectorStart = {
          endpointNodeId: nodes[i].id,
          magnet: "AUTO",
        };

        connector.connectorEnd = {
          endpointNodeId: nodes[i + 1].id,
          magnet: "AUTO",
        };
      }

      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };
}
