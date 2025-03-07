/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { ListaProcesos } from "../types/process";

export default function useProcesos(code: any) {
    const [data, setData] = useState<ListaProcesos | { error: string }>([]);

    const output = {
        "main.cpp": code,
        "forkBDetect": false,
        "helper": false
    }
    useEffect(() => {
        if (code) {
            const fetchData = async () => {
                try {
                    const response = await fetch('http://backend:5000/run', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(output),
                    });

                    console.log({output})
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
