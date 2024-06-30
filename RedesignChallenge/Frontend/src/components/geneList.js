import React, { useEffect, useState } from "react";
import { List, Card, Input } from "antd";
import InfiniteScroll from 'react-infinite-scroll-component';

export const GeneList = ({ selectedGene, setSelectedGene, setRelatedGeneData }) => {
    const [geneListData, setGeneListData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/geneList?page=${page}`);
            const data = await response.json();
            if (data.length === 0) {
                setHasMore(false);
            } else {
                setGeneListData(prevData => [...prevData, ...data]);
            }
        };
        fetchData();
    }, [page]);


    const fetchMoreData = () => {
        setPage(page + 1);
    };

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
            id="scrollableCard"
            title="Gene List"
            extra={<Input size="small" placeholder="Search Genes" onChange={e => setSearchTerm(e.target.value)} />}
            style={{ marginTop: 15, height: "68vh", overflow: "auto" }}
        >
            <InfiniteScroll
                dataLength={filteredData.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                scrollableTarget="scrollableCard"
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
            </InfiniteScroll>
        </Card>
    );
};
