const axios = require('axios');
const inquirer = require('inquirer');
const ora = require('ora')
const chalk = require('chalk')
const cheerio = require('cheerio');
const Table = require('cli-table');

const fetch = async (target) => {
    const url = `https://www.taipower.com.tw/d006/loadGraph/loadGraph/data/genary_eng.json`
    const resp = await axios({
        method: 'get',
        url
    })

    // const data = resp.json();
    return resp.data;
}

const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

module.exports = async function getPowerGen() {
    const spinner = ora('Fetching data').start();

    const response = await fetch();

    const timestamp = response[''];
    const data = response.dataset;


    // Remove subtotal fields
    const removeSubTotals = data.filter(d => d[1] !== 'Subtotal')
    const cleanData = removeSubTotals.map(d => {

        const $ = cheerio.load(d[0]);
        const type = $('b').text();
        const name = d[1]
        const capacity = d[2]
        const generation = d[3]
        const percentage = d[4]

        return {
            type,
            name,
            capacity,
            generation,
            percentage
        }
    });

    const groupedByType = groupBy('type');
    const groupedData = await groupedByType(cleanData)

    const {
        SOLAR,
        HYDRO,
        NUCLEAR,
        WIND,
        GEOTHERMAL,
        COAL,
        IPPCOAL,
        COGEN,
        LNG,
        IPPLNG,
        OIL,
        DIESEL,
        PUMPINGGEN
    } = groupedData
    const lowCarbon = [...SOLAR, ...HYDRO, ...NUCLEAR, ...GEOTHERMAL, ...WIND, ...PUMPINGGEN]
    const renewable = [...SOLAR, ...WIND, ...HYDRO, ...GEOTHERMAL, ...PUMPINGGEN]
    const dirty = [...COAL, ...IPPCOAL, ...COGEN, ...LNG, ...IPPLNG, ...OIL, ...DIESEL]

    const reducer = (input) => input.reduce((acc, curr) => {
        const value = curr.generation !== 'N/A' ? parseFloat(curr.generation) : 0;
        // console.log(curr.generation)
        return acc + value;
    }, 0)

    const lowCarbonTotalGen = reducer(lowCarbon)
    const renewableTotalGen = reducer(renewable)
    const dirtyTotalGen = reducer(dirty)
    const totalSolar = reducer([...SOLAR])
    const totalWind = reducer([...WIND])
    const totalGeothermal = reducer([...GEOTHERMAL])
    const totalHydro = reducer([...HYDRO, ...PUMPINGGEN])

    const totalGen = lowCarbonTotalGen + renewableTotalGen + dirtyTotalGen;

    const percentageLowCarbon = (lowCarbonTotalGen / totalGen) * 100
    const percentageRenewable = (renewableTotalGen / totalGen) * 100
    const percentageDirty = (dirtyTotalGen / totalGen) * 100
    const percentageSolar = (totalSolar / totalGen) * 100
    const percentageWind = (totalWind / totalGen) * 100
    const percentageGeothermal = (totalGeothermal / totalGen) * 100
    const percentageHydro = (totalHydro / totalGen) * 100

    const renewablesTable = {
        'Solar': percentageSolar,
        'Wind': percentageWind,
        'Hydro': percentageHydro,
        'Geothermal': percentageGeothermal
    }


    spinner.stop();

    console.log(chalk.yellow.bold('Updated at: ') + timestamp);
    console.log(chalk.blueBright.bold('Current low-carbon energy generation: ') + parseFloat(percentageLowCarbon).toFixed(2) + '%');
    console.log(chalk.greenBright.bold('Current renewable energy generation: ') + parseFloat(percentageRenewable).toFixed(2) + '%');
    console.log(chalk.white.dim.bold('Current dirty energy generation: ') + parseFloat(percentageDirty).toFixed(2) + '%');
    console.log()
    console.log(chalk.greenBright.bold('Breakdown of renewables:'))

    var table = new Table({
        head: [chalk.yellowBright.bold('Solar'), chalk.cyanBright.bold('Wind'), chalk.blueBright.bold('Hydro'), chalk.redBright.bold('Geothermal')],
    });

    table.push([(parseFloat(percentageSolar).toFixed(2) + '%'), (parseFloat(percentageWind).toFixed(2) + '%'), (parseFloat(percentageHydro).toFixed(2) + '%'), (parseFloat(percentageGeothermal).toFixed(2) + '%')])

    console.log(table.toString())
}