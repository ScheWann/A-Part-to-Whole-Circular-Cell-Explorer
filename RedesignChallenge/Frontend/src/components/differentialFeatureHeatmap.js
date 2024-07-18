import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./Styles/differentialFeatureTable.css";

export const DifferentialFeatureHeatmap = ({ differentialChartData }) => {
    const ref = useRef();

    useEffect(() => {
        console.log(differentialChartData, '//////')
    }, []);

    return (
        <>123</>
    );
};
