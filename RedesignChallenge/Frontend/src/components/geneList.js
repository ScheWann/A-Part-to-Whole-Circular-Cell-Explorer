import React, { useEffect, useState } from "react";
import { List, Card } from "antd";

export const GeneList = () => {
    const [geneListData, setGeneListData] = useState();

    useEffect(() => {
        {
            fetch("/geneList").then(res => res.json()).then(data => {
                setGeneListData(data);
            });
        }
    }, []);

    return (
        <>
            <Card
                size="small"
                title="Gene List"
                style={{marginTop: 15, height: "67vh", overflow: "auto"}}
            >
                <List
                    size="small"
                    dataSource={geneListData}
                    style={{ height: "55vh", overflow: "auto" }}
                    renderItem={(item) => (
                        <List.Item>
                            {item}
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );
};
