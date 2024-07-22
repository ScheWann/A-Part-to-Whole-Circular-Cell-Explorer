import * as d3 from "d3";

// Takes an array of numbers and compute some summary statistics from it like quantiles, median..
// Those summary statistics are the info needed to draw a boxplot
export const getSummaryStats = (data: number[]) => {
    const sortedData = data.sort(function(a, b){return a - b});

    const q1: number = d3.quantile(sortedData, .25) as number
    const median = d3.quantile(sortedData, .5)
    const q3: number = d3.quantile(sortedData, .75) as number;

    const interQuantileRange = q3 - q1
    const min = q1 - 1.5 * interQuantileRange
    const max = q3 + 1.5 * interQuantileRange
    console.log(min, q1, median, q3, max, 'summary stats')
    return {min, q1, median, q3, max}
}
