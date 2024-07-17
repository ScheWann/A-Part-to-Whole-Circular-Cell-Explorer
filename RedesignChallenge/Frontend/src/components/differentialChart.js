import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Switch, Checkbox } from "antd";
import { DifferentialFeatureTable } from './differentialFeatureTable';

export const DifferentialChart = () => {
    const [differentialChartTabKey, setDifferentialChartTabKey] = useState("tableTab");
    const [differentialChartData, setDifferentialChartData] = useState([]);
    const onChangedifferentialChartTabKey = key => {
        setDifferentialChartTabKey(key);
    }

    const differentialChartList = {
        "tableTab": <DifferentialFeatureTable />,
        "HeatmapTab": <div>Heatmap Tab</div>,
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
