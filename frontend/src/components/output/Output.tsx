/* eslint-disable @typescript-eslint/no-explicit-any */
import "./Output.css";

export default function Output(props: any) {
  const collectOutputs = (data: any) => {
    let outputs: any = [];
    data.forEach((item: any) => {
      if (item.output) {
        outputs.push(item.output);
      }
      if (item.process && item.process.length > 0) {
        outputs = outputs.concat(collectOutputs(item.process));
      }
    });
    return outputs;
  };

  const allOutputs = collectOutputs(Array.isArray(props.procesos) ? props.procesos : []).join("");

  const formattedOutputs = allOutputs
    .split("\\n")
    .filter((line: any) => line.trim() !== "");

  return (
    <>
      <div className="top-bar">OUTPUT</div>
      <div className="terminal">
        ~/Users/OpenSourceUDP/Projects/Playground-SO
        <div className="output">
          {formattedOutputs.map((line: any, index: any) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
    </>
  );
}
