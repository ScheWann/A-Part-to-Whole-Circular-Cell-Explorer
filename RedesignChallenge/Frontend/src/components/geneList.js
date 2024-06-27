import React, { useEffect, useState } from "react";
import { List, Card } from "antd";

export const GeneList = () => {
    const [geneListData, setGeneListData] = useState();
    const [selectedItem, setSelectedItem] = useState(null); // State to track the selected item

    useEffect(() => {
        fetch("/geneList")
            .then(res => res.json())
            .then(data => {
                setGeneListData(data);
            });
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem(item); // Set the clicked item as selected
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
                style={{ height: "55vh", overflow: "auto" }}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            transition: "background-color 0.3s ease",
                            backgroundColor: item === selectedItem ? '#6CB4EE' : 'transparent',
                            color: item === selectedItem ? '#fff' : '#000',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#6CB4EE", e.currentTarget.style.color = "#fff")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent", e.currentTarget.style.color = "#000")}
                        onClick={() => handleItemClick(item)}
                    >
                        {item}
                    </List.Item>
                )}
            />
        </Card>
    );
};
