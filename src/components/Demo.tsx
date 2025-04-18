import Head from "next/head";
import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
// import { removeBackground } from "@imgly/background-removal";


const tools = [
  {
    id: "filter",
    name: "Higher Filter",
    settings: [
      { type: "color", label: "Color", state: "color", default: "#54FF56" },
      { type: "checkbox", label: "Reverse filter", state: "reverseFilter", default: false },
      { type: "range", label: "Filter Threshold", state: "filterThreshold", min: 0, max: 255, default: 0 },
      { type: "range", label: "Grainy", state: "grainyThreshold", min: 0, max: 100, default: 0 },
      { type: "range", label: "Motion Blur", state: "motionBlur", min: 0, max: 100, default: 0 },
      { type: "range", label: "Opacity Layer", state: "opacityLayer", min: 0, max: 100, default: 0 }
    ],
    apply: (image: HTMLImageElement) => {
      if (!image) return;
      // Cast input elements to HTMLInputElement for stricter type checking
      const reverseFilter = ((document.getElementById("reverseFilter") as HTMLInputElement)?.checked) ?? false;
      const filterThreshold = parseInt(((document.getElementById("filterThreshold") as HTMLInputElement)?.value) || "0", 10);
      const grainyThreshold = parseInt(((document.getElementById("grainyThreshold") as HTMLInputElement)?.value) || "0", 10);
      const motionBlur = parseInt(((document.getElementById("motionBlur") as HTMLInputElement)?.value) || "0", 10);
      const color = ((document.getElementById("color") as HTMLInputElement)?.value) || "#000000";
      const opacityLayer = parseInt(((document.getElementById("opacityLayer") as HTMLInputElement)?.value) || "0", 10);

      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
          : null;
      };
      const filterColor = hexToRgb(color);
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      if (!canvas || !filterColor) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = image.width;
      canvas.height = image.height;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, image.width, image.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if ((reverseFilter && avg <= filterThreshold) || (!reverseFilter && avg > filterThreshold)) {
            data[i] = filterColor.r;
            data[i + 1] = filterColor.g;
            data[i + 2] = filterColor.b;
            data[i + 3] = data[i + 3] * (avg / 255);
          }
        }
      }
      context.putImageData(imageData, 0, 0);
      if (grainyThreshold !== 0) {
        for (let i = 0; i < data.length; i += 4) {
          const grain = Math.random() * grainyThreshold;
          data[i] += grain;
          data[i + 1] += grain;
          data[i + 2] += grain;
        }
        context.putImageData(imageData, 0, 0);
      }
      if (motionBlur !== 0) {
        const steps = 100;
        const alpha = 1 / steps;
        context.save();
        for (let i = 0; i < steps; i++) {
          const offset = (i - steps / 2) * (motionBlur / steps);
          context.globalAlpha = alpha;
          context.drawImage(canvas, offset, 0, canvas.width, canvas.height);
        }
        context.restore();
      }
      if (opacityLayer !== 0) {
        context.fillStyle = `rgba(0,0,0,${opacityLayer / 100})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  },
  {
    id: "highertags",
    name: "Higher Tags",
    settings: [
      { type: "select", label: "Select Font", state: "selectFont", options: ["Helvetica", "Times New Roman", "Comic Sans", "Higher TM", "Arrow", "Scanner", "Adidagh"], default: "Helvetica" },
      { type: "color", label: "Color", state: "color", default: "#000000" },
      { type: "checkbox", label: "Foreground", state: "foreground", default: false },
      { type: "range", label: "Offset X", state: "offsetX", min: -1500, max: 1500, default: 0 },
      { type: "range", label: "Offset Y", state: "offsetY", min: -1500, max: 1500, default: 0 },
      { type: "range", label: "Scale", state: "scale", min: 0, max: 10, step: 0.01, default: 1 },
      { type: "range", label: "Skew X", state: "skewX", min: -360, max: 360, default: 0 },
      { type: "range", label: "Skew Y", state: "skewY", min: -360, max: 360, default: 0 },
      { type: "range", label: "Rotate", state: "offsetTheta", min: -360, max: 360, default: 0 },
      { type: "range", label: "Drag Gap", state: "dragGap", min: 0, max: 5000, default: 0 },
      { type: "range", label: "Drag reps", state: "dragReps", min: 0, max: 100, default: 0 },
      { type: "hidden", state: "processedImageUrl", default: "" },
      { type: "range", label: "Emboss", state: "emboss", min: 0, max: 100, default: 0 },
      { type: "range", label: "Opacity", state: "opacity", min: 0, max: 100, default: 100 }
    ],
    apply: (image: HTMLImageElement) => {
      if (!image) return;
      const offsetX = parseInt(((document.getElementById("offsetX") as HTMLInputElement)?.value) || "0", 10);
      const offsetY = parseInt(((document.getElementById("offsetY") as HTMLInputElement)?.value) || "0", 10);
      const scale = parseFloat(((document.getElementById("scale") as HTMLInputElement)?.value) || "1");
      const offsetTheta = parseInt(((document.getElementById("offsetTheta") as HTMLInputElement)?.value) || "0", 10);
      const foreground = ((document.getElementById("foreground") as HTMLInputElement)?.checked) ?? false;
      const dragGap = parseInt(((document.getElementById("dragGap") as HTMLInputElement)?.value) || "0", 10);
      const dragReps = parseInt(((document.getElementById("dragReps") as HTMLInputElement)?.value) || "0", 10);
      const processedImageUrlElem = document.getElementById("processedImageUrl") as HTMLInputElement;
      const processedImageUrl = processedImageUrlElem ? processedImageUrlElem.value : "";
      const opacity = parseInt(((document.getElementById("opacity") as HTMLInputElement)?.value) || "0", 10);
      const selectFont = ((document.getElementById("selectFont") as HTMLSelectElement)?.value) || "Helvetica";
      const color = ((document.getElementById("color") as HTMLInputElement)?.value) || "#000000";
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = image.width;
      canvas.height = image.height;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, image.width, image.height);
      const hat = new Image();
      hat.onload = () => {
        context.save();
        if (!foreground) {
          context.translate(offsetX, offsetY);
          context.rotate((offsetTheta * Math.PI) / 180);
          context.globalAlpha = opacity / 100;
          if (dragReps > 0) {
            for (let i = 0; i < dragReps; i++) {
              context.drawImage(hat, offsetX, offsetY + i * dragGap, hat.width * scale, hat.height * scale);
            }
          } else {
            context.drawImage(hat, offsetX, offsetY, hat.width * scale, hat.height * scale);
          }
        } else {
          if (processedImageUrl && processedImageUrl !== "processing") {
            const foregroundImg = new Image();
            foregroundImg.onload = () => {
              context.save();
              context.globalAlpha = opacity / 100;
              if (dragReps > 0) {
                for (let i = 0; i < dragReps; i++) {
                  context.save();
                  context.translate(offsetX, offsetY);
                  context.rotate((offsetTheta * Math.PI) / 180);
                  context.drawImage(hat, 0, i * dragGap, hat.width * scale, hat.height * scale);
                  context.restore();
                }
              } else {
                context.translate(offsetX, offsetY);
                context.rotate((offsetTheta * Math.PI) / 180);
                context.drawImage(hat, 0, 0, hat.width * scale, hat.height * scale);
              }
              context.restore();
              context.drawImage(foregroundImg, 0, 0, canvas.width, canvas.height);
            };
            foregroundImg.src = processedImageUrl;
          }
        }
        context.restore();
        context.globalAlpha = 1;
      };
      let svgPath;
      switch (selectFont) {
        case "Helvetica":
          svgPath = "/higherhelvetica.svg";
          break;
        case "Times New Roman":
          svgPath = "/higheritalic.svg";
          break;
        case "Comic Sans":
          svgPath = "/highercomicsans.svg";
          break;
        case "Higher TM":
          svgPath = "/highertm.svg";
          break;
        case "Arrow":
          svgPath = "/higherarrow.svg";
          break;
        case "Scanner":
          svgPath = "/higherscanner.svg";
          break;
        case "Adidagh":
          svgPath = "/adidagh.svg";
          break;
        default:
          svgPath = "/higherdefault.svg";
      }
      if (["/higherscanner.svg"].includes(svgPath)) {
        hat.src = svgPath;
        return;
      }
      fetch(svgPath)
        .then(response => response.text())
        .then(svgText => {
          const coloredSvg = svgText.replace(/fill="[^"]*"/g, `fill="${color}"`);
          const blob = new Blob([coloredSvg], { type: "image/svg+xml" });
          hat.src = URL.createObjectURL(blob);
        });
    }
  }
];

interface DemoProps {
  title?: string;
}


export default function Demo({title}: DemoProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState("filter");
  const [history, setHistory] = useState<string[]>([]);

  const saveHistory = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    setHistory((prev) => [...prev, dataURL]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
      setHistory((prev) => prev.slice(0, -1));
    };
    img.src = lastState;
  };

  const renderSettings = () => {
    const tool = tools.find((t) => t.id === activeTool);
    if (!tool) return null;
    return (
      <div>
        {tool.settings.map((setting) => {
          switch (setting.type) {
            case "checkbox":
              return (
                <div key={setting.state} style={{ marginTop: 20, display: "flex", alignItems: "center" }}>
                  <label htmlFor={setting.state} style={{ fontSize: 12, marginRight: 10 }}>
                    {setting.label}
                  </label>
                  <input type="checkbox" id={setting.state} defaultChecked={Boolean(setting.default)} onChange={() => image && tool.apply(image)} />
                </div>
              );
            case "range":
              return (
                <div key={setting.state} style={{ marginTop: 20, display: "flex", alignItems: "center" }}>
                  <label htmlFor={setting.state} style={{ fontSize: 12, marginRight: 10 }}>
                    {setting.label}:
                  </label>
                  <input
                    type="range"
                    id={setting.state}
                    min={setting.min}
                    max={setting.max}
                    step={setting.step || 1}
                    // defaultValue={setting.default}
                    onChange={(e) => {
                      if (!image) return;
                      const element = document.getElementById(setting.state) as HTMLInputElement;
                      if (element) element.value = e.target.value;
                      tool.apply(image);
                    }}
                  />
                </div>
              );
            case "select":
              return (
                <div key={setting.state} style={{ marginTop: 20 }}>
                  <label htmlFor={setting.state} style={{ fontSize: 12, marginRight: 10 }}>
                    {setting.label}:
                  </label>
                  <select id={setting.state} defaultValue={String(setting.default)} onChange={() => image && tool.apply(image)}>
                    {setting.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            case "color":
              return (
                <div key={setting.state} style={{ marginTop: 20, display: "flex", alignItems: "center" }}>
                  <label htmlFor={setting.state} style={{ fontSize: 12, marginRight: 10 }}>
                    {setting.label}:
                  </label>
                  <input type="color" id={setting.state} defaultValue={setting.default.toString()} onChange={() => image && tool.apply(image)} />
                </div>
              );
            case "hidden":
              return <input key={setting.state} type="hidden" id={setting.state} defaultValue={String(setting.default)} />;
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setImage(img);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            if (!event.target) return;
            const img = new Image();
            img.onload = () => {
              const canvas = document.getElementById("canvas") as HTMLCanvasElement;
              if (!canvas) return;
              const context = canvas.getContext("2d");
              if (!context) return;
              canvas.width = img.width;
              canvas.height = img.height;
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.drawImage(img, 0, 0);
              setImage(img);
            };
            img.src = event.target.result as string;
            saveHistory();
          };
          if (!blob) return;
          reader.readAsDataURL(blob);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [image]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Farcaster Mini App using Higher Combined Template" />
      </Head>
      <div style={{ padding: 20 }}>
        <h1>Higher MiniApp</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
            border: "1px solid #333",
            marginTop: 20,
            borderRadius: 10
          }}
        >
          <div style={{ flexBasis: "90%", display: "flex", flexDirection: "column", gap: 10 }}>
            <canvas id="canvas" style={{ width: "100%", maxWidth: 800, height: "auto" }} />
          </div>
          <div
            style={{
              flexBasis: "30%",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              background: "#101010",
              padding: 20,
              borderRadius: 10,
              color: "white"
            }}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div style={{ display: "flex", marginBottom: 20, background: "#333", borderRadius: 5 }}>
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  style={{
                    flex: 1,
                    border: "none",
                    background: activeTool === tool.id ? "#444" : "#333",
                    color: activeTool === tool.id ? "#fff" : "#999",
                    fontSize: 14
                  }}
                  onClick={() => setActiveTool(tool.id)}
                >
                  {tool.name}
                </button>
              ))}
            </div>
            <div>{renderSettings()}</div>
            <Button
              onClick={() => {
                const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                if (canvas) {
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                setImage(null);
                setActiveTool("filter");
              }}
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                if (canvas) {
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  const dataURL = canvas.toDataURL();
                  const img = new Image();
                  img.src = dataURL;
                  setImage(img);
                }
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                if (!canvas) return;
                const a = document.createElement("a");
                a.href = canvas.toDataURL("image/png");
                a.download = "higher_miniapp.png";
                a.click();
              }}
            >
              Download
            </Button>
            <Button onClick={undo}>Undo</Button>
          </div>
        </div>
      </div>
    </>
  );
}
