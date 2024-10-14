// useProcesos.ts
import { useEffect, useState } from "react";
import { ListaProcesos } from "../types/process";

export default function useProcesos(code) {
    const [data, setData] = useState<ListaProcesos | { error: string }>([]);

    useEffect(() => {
        if (code) {
            const fetchData = async () => {
                try {
                    const response = await fetch('http://localhost:8080/Run', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                        body: code,
                    });

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
                    setData({ error: error.message });
                }
            };
            fetchData();
        }
    }, [code]);

    return { data };
}
