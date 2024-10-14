import "./Output.css";

export default function Output(props) {
  // Función recursiva para recopilar todos los outputs
  const collectOutputs = (data) => {
    let outputs = [];
    data.forEach((item) => {
      if (item.output) {
        outputs.push(item.output);
      }
      if (item.process && item.process.length > 0) {
        outputs = outputs.concat(collectOutputs(item.process));
      }
    });
    return outputs;
  };

  // Asegúrate de que props.procesos es un arreglo
  const allOutputs = collectOutputs(Array.isArray(props.procesos) ? props.procesos : []).join("");

  // Dividir la cadena por saltos de línea para renderizar cada línea por separado
  const formattedOutputs = allOutputs
    .split("\\n")
    .filter((line) => line.trim() !== "");

  return (
    <>
      <div className="top-bar">OUTPUT</div>
      <div className="terminal">
        ~/Users/OpenSourceUDP/Projects/Playground-SO
        <div className="output">
          {formattedOutputs.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
    </>
  );
}
