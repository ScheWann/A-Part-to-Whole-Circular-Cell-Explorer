import React, { useState, useEffect } from 'react';
import { Table } from "antd";
import "./Styles/differentialFeatureTable.css";

export const DifferentialFeatureTable = ({ differentialChartData, currentPage, pageSize, setCurrentPage, setPageSize }) => {

    const columns = [
        {
            title: 'Gene',
            dataIndex: 'FeatureName',
            key: 'FeatureName',
            fixed: 'left',
            align: 'center',
            width: 60
        },
        ...Array.from({ length: 9 }, (_, i) => ({
            title: `Cluster ${i + 1}`,
            children: [
                // {
                //     title: 'Avg',
                //     dataIndex: `cluster${i + 1}Avg`,
                //     key: `cluster${i + 1}Avg`,
                //     width: 100,
                //     align: 'center',
                //     render: (value) => `${Number(value).toExponential(2)}`
                // },
                {
                    title: 'L2FC',
                    dataIndex: `cluster${i + 1}L2FC`,
                    key: `cluster${i + 1}L2FC`,
                    width: 100,
                    align: 'center',
                    render: (value, record) => {
                        const style = value < 0 && record[`cluster${i + 1}PValue`] >= 0.10 ? { color: '#808080' } : {};
                        return <span style={style}>{Number(value).toExponential(2)}</span>;
                    }
                },
                {
                    title: 'P-value',
                    dataIndex: `cluster${i + 1}PValue`,
                    key: `cluster${i + 1}PValue`,
                    width: 100,
                    align: 'center',
                    render: (value, record) => {
                        const style = record[`cluster${i + 1}L2FC`] < 0 && value >= 0.10 ? { color: '#808080' } : {};
                        return <span style={style}>{Number(value).toExponential(2)}</span>;
                    }
                }
            ]
        }))
    ];

    const handleTableChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    return (
        <Table
            style={{ height: "100%", width: "100%" }}
            size="small"
            columns={columns}
            dataSource={differentialChartData.items.map((item, index) => ({ key: index, ...item }))}
            pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: differentialChartData.total,
                showSizeChanger: false,
                onChange: handleTableChange,
            }}
            scroll={{ x: 1000, y: '33vh' }}
        />
    );
};
