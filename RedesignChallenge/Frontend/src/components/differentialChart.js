import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Switch, Checkbox } from "antd";
import { DifferentialFeatureTable } from './differentialFeatureTable';
import { DifferentialFeatureHeatmap } from './differentialFeatureHeatmap';

export const DifferentialChart = () => {
    const [differentialChartTabKey, setDifferentialChartTabKey] = useState("tableTab");
    const [differentialChartData, setDifferentialChartData] = useState({
        items: [],
        page: 1,
        per_page: 15,
        total: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const onChangedifferentialChartTabKey = key => {
        setDifferentialChartTabKey(key);
    }

    useEffect(() => {
        fetchDifferentialData(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchDifferentialData = (page, size) => {
        fetch(`/getUpRegulatedL2FCGenesbyPage?page=${page}&per_page=${size}`)
            .then(response => response.json())
            .then(data => {
                setDifferentialChartData(data);
            });
    };

    const differentialChartList = {
        "tableTab": <DifferentialFeatureTable differentialChartData={differentialChartData} currentPage={currentPage} pageSize={pageSize} setCurrentPage={setCurrentPage} setPageSize={setPageSize} />,
        "HeatmapTab": <DifferentialFeatureHeatmap differentialChartData={differentialChartData} />,
        "ViolinTab": <div>Violin Tab</div>
    }

    const tabList = [
        {
            key: "tableTab",
            tab: "Table"
        },
        {
            key: "HeatmapTab",
            tab: "Heatmap"
        },
        {
            key: "ViolinTab",
            tab: "Violin Plot"
        }
    ]

    return (
        <Card
            size="small"
            tabList={tabList}
            activeTabKey={differentialChartTabKey}
            onTabChange={onChangedifferentialChartTabKey}
            style={{ height: "50vh" }}
        >
            {differentialChartList[differentialChartTabKey]}
        </Card>
    );
};
