import React, { useEffect, useState } from "react";
import { List, Card, Input } from "antd";

export const GeneList = ({ selectedGene, setSelectedGene, setRelatedGeneData }) => {
    const [geneListData, setGeneListData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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
                setRelatedGeneData(data);
            });
    };

    const filteredData = searchTerm ? geneListData.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase())) : geneListData;

    return (
        <Card
            size="small"
            title="Gene List"
            extra={<Input size="small" placeholder="Search Genes" onChange={e => setSearchTerm(e.target.value)} />}
            style={{ marginTop: 15, height: "65vh", overflow: "auto" }}
        >
            <List
                size="small"
                dataSource={filteredData}
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
