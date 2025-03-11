/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Code, ListaProcesos } from "../types/process";

export default function useProcesos(code: Code | null) {
    const [data, setData] = useState<ListaProcesos | { error: string }>([]);

    const codeArray = code ? Object.entries(code).map(([filename, content]) => ({
        filename,
        content,
    })) : [];

    const output = {
        "code": codeArray,
        "forkBDetect": false,
        "helper": false
    };

    console.log({ output });

    useEffect(() => {
        if (codeArray.length > 0) {
            const fetchData = async () => {
                try {
                    const response = await fetch('http://127.0.0.1:5000/run', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(output),
                    });

                    console.log({ output });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const jsonData = await response.json();
                        setData(jsonData);
                    } else {
                        setData({ error: "La respuesta no es JSON" });
                    }
                } catch (error) {
                    setData({ error: (error as Error).message });
                }
            };
            fetchData();
        }
    }, [code]);

    return { data };
}
