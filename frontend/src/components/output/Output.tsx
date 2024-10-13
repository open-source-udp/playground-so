import "./Output.css";

const responseData = [
  {
    output: "dog\\ndog\\n",
    pid: 11988,
    process: [
      {
        pid: 11989,
        process: [
          {
            pid: 11991,
            process: [
              {
                pid: 11993,
              },
            ],
          },
          {
            pid: 11994,
          },
        ],
      },
      {
        pid: 11990,
        process: [
          {
            pid: 11992,
          },
        ],
      },
      {
        pid: 11995,
      },
    ],
  },
];

export default function Output() {
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

  // Obtener todos los outputs y unirlos en una sola cadena
  const allOutputs = collectOutputs(responseData).join("");

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
