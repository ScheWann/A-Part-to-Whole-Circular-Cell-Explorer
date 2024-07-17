import React, { useState, useEffect } from 'react';
import "./Styles/differentialFeatureTable.css";

export const DifferentialFeatureHeatmap = () => {

    useEffect(() => {
        fetch('/getUpRegulatedL2FCGenes')
            .then(response => response.json())
            .then(data => {
                console.log(data, '//////');
            });
    }, []);

    return (
        <>123</>
    );
};
