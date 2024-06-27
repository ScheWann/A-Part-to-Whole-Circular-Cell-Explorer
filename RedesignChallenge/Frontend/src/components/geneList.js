import React, { useEffect, useRef, useState } from "react";

export const GeneList = () => {
    const [geneListData, setGeneListData] = useState();

    useEffect(() => {
        {
            fetch("/geneList").then(res => res.json()).then(data => {
                setGeneListData(data);
                console.log(data);
            });
        }
    }, []);

    return (
        <>
            123
        </>
    );
};
