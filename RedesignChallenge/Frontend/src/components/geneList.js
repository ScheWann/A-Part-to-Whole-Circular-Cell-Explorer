import React, { useEffect, useState } from "react";
import { List, Card } from "antd";

export const GeneList = ({ selectedGene, setSelectedGene, setRelatedGeneData }) => {
    const [geneListData, setGeneListData] = useState([]);

    useEffect(() => {
        fetch("/geneList")
            .then(res => res.json())
            .then(data => {
                setGeneListData(data);
            });
    }, []);

    const handleItemClick = (item) => {
        setSelectedGene(item);
        fetch("/geneExpression", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gene: item })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Related data fetched:', data);
                setRelatedGeneData(data);
            })
    };

    return (
        <Card
            size="small"
            title="Gene List"
            style={{ marginTop: 15, height: "67vh", overflow: "auto" }}
        >
            <List
                size="small"
                dataSource={geneListData}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            transition: "background-color 0.3s ease",
                            backgroundColor: item === selectedGene ? '#6CB4EE' : 'transparent',
                            color: item === selectedGene ? '#fff' : '#000',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#6CB4EE"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = item === selectedGene ? '#6CB4EE' : 'transparent'; e.currentTarget.style.color = item === selectedGene ? '#fff' : '#000'; }}
                        onClick={() => handleItemClick(item)}
                    >
                        {item}
                    </List.Item>
                )}
            />
        </Card>
    );
};
