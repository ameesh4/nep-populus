import axios from 'axios';
import * as fs from 'node:fs';
import env from 'custom-env';

env.env('urls');

const province = {
    "koshi" : 1,
    "madhesh": 2,
    "bagmati": 3,
    "gandaki": 4,
    "lumbini": 5,
    "karnali": 6,
    "sudurpaschim": 7
}

var jresponse = {
    status: 404,
    message: 'Not Found'
}

async function nepopulusFetch(url){
    try{
        const response = await axios.get(url);
        return response.data;
    }
    catch(error){
        jresponse.status = error.response.status;
        jresponse.message = error.response.statusText;
        throw jresponse;
    }
}

export async function generalPopulationData(){
    try{
        const response = await nepopulusFetch(process.env.GENERAL)

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "total": response.data.total,
            "previous": response.data.rateTotal.series.data[1],
            "difference": response.data.rateTotal.difference,
            "growthRate": response.data.growth_rate,
            "male" : {
                "total": response.data.male,
                "percentage": response.data.sex_chart.series[0],
            },
            "female": {
                "total": response.data.female,
                "percentage": response.data.sex_chart.series[1],
            },
            "density": {
                "total": response.data.density,
                "previous": response.data.density_growth_percentage.series.data[1],
                "difference": response.data.density_growth_percentage.difference,
                "interCensualDensityGrowthRate": (((response.data.density - response.data.density_growth_percentage.series.data[1]) / response.data.density_growth_percentage.series.data[1])*100)/10,
            },
            "sexRatio": {
                "MaletoFemaleRatio" : response.data.sex_ratio_percentage.series.data[0],
                "FemaletoMaleRatio" : response.data.sex_ratio_percentage.series.data[1],
            }
        }
        return responseData;
    } catch(error){
        throw error;
    }
}

function setUrlProvince(name, urls){
    name = name.toLowerCase();
    let number = province[name];
    let u = urls + '?province=' + number;
    return u;
}


function setUrlProvinceAndDistrict(name, districtName, urls){
    let jsonString = fs.readFileSync('../provinceDistrict.json');
    let data = JSON.parse(jsonString);
    name = name.toLowerCase();
    let pnumber = province[name];
    for(let x in data){
        if(data[x].name.toLowerCase() == name){
            let i = data[x].dist_start + 1;
            for(let y in data[x].districts){
                if(data[x].districts[y].name.toLowerCase() == districtName.toLowerCase()){
                    let dnumber = i;
                    let u = urls + "?province=" + pnumber + '&district=' + dnumber;
                    return u;
                }
                i++;
            }
        }
    }
    throw {
        status: 404,
        message: 'District and Province Combination Error'
    }
}

function setUrlProvinceDistrictAndMunicipality (name, district, municipality, urls){
    let jsonString = fs.readFileSync('../provinceDistrict.json');
    let data = JSON.parse(jsonString);

    if (!(name.toLowerCase() in province)){
        throw {
            status: 404,
            message: 'Province Not Found' 
        }
    }

    let pnumber = province[name.toLowerCase()];
    for (let x in data){
        if(data[x].name.toLowerCase() == name.toLowerCase()){
            let i = data[x].dist_start + 1;
            for(let y in data[x].districts){
                if(data[x].districts[y].name.toLowerCase() == district.toLowerCase()){
                    let dnumber = i;
                    let j = 1;
                    for(let z in data[x].districts[y].gapas){
                        if(data[x].districts[y].gapas[z].toLowerCase() == municipality.toLowerCase()){
                            let mnumber = j;
                            let url = urls + "?province=" + pnumber + '&district=' + dnumber + '&municipality=' + mnumber;
                            return url;
                        }
                        j++;
                    }
                }
                i++;
            }
        }
    }
    throw {
        status: 404,
        message: 'District and Municipality combination error'
    }
}

export async function getPopulationByProvince(province){
    try{
        let url = setUrlProvince(province, process.env.GENERAL);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Population of " + province + " listed successfully",
            "total": response.data.total,
            "growthRate": response.data.growth_rate,
            "male" : {
                "total": response.data.male,
                "percentage": response.data.sex_chart.series[0],
            },
            "female": {
                "total": response.data.female,
                "percentage": response.data.sex_chart.series[1],
            },
            "density": response.data.density,   
            "sexRatio": response.data.sex_ratio,
        }
        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getPopulationByDistrict(province, district){
    try{
        let url = setUrlProvinceAndDistrict(province, district, process.env.GENERAL);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Population of " + district + " listed successfully",
            "total": response.data.total,
            "previous": response.data.rateTotal.series.data[1],
            "difference": response.data.rateTotal.difference,
            "growthRate": response.data.growth_rate,
            "male" : {
                "total": response.data.male,
                "percentage": response.data.sex_chart.series[0],
            },
            "female": {
                "total": response.data.female,
                "percentage": response.data.sex_chart.series[1],
            },
            "density": response.data.density,
            "sexRatio": response.data.sex_ratio,
        }
        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getPopulationByMunicipality(province, district, municipality){
    try{
        let url = setUrlProvinceDistrictAndMunicipality(province, district, municipality, process.env.WARD);
        let response = await nepopulusFetch(url);
        
        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Population of " + municipality + " listed successfully",
            "total": response.data.total,
            "previous": response.data.rateTotal.series.data[1],
            "difference": response.data.rateTotal.difference,
            "growthRate": response.data.growth_rate,
            "male" : {
                "total": response.data.total_male,
                "percentage": response.data.sex_chart.series[0],
            },
            "female": {
                "total": response.data.total_female,
                "percentage": response.data.sex_chart.series[1],
            },
            "density": response.data.pop_density,
            "sexRatio": response.data.sex_ratio,
        }
        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getPopulationPerWard(province, district, municipality){
    try{
        let url = setUrlProvinceDistrictAndMunicipality(province, district, municipality, process.env.WARD_DISTRIBUTION);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }
        let i = 0;
        let population = [];
        while (i < response.data.categories.length) {
            population.push(response.data.countSeries[0].data[i]+response.data.countSeries[1].data[i]);
            i++;
        }

        let responseData = {
            "status" : 200,
            "message": "Data for Population per ward of " + municipality + " listed successfully",
            "ward_numbers": response.data.categories,
            "population": population,
            "male": response.data.countSeries[0].data,
            "female": response.data.countSeries[1].data
        }
        return responseData;
    }catch(error){
        throw error;
    }
}

export async function generalDisabilityData(){
    try{
        let response = await nepopulusFetch(process.env.DISABILITY);
        let responseSummary = await nepopulusFetch(process.env.DISABILITY_SUMMARY);
        
        if (!response || !response.data || !responseSummary || !responseSummary.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Disability overview listed successfully",
            "categories": response.data.categories,
            "total": {
                "population_to_disability_ratio": responseSummary.data.total.percentage,
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "population_to_disability_ratio": responseSummary.data.male.percentage,
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "population_to_disability_ratio": responseSummary.data.female.percentage,
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        }

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getDisablityDataByProvince(province){
    try{
        let url = setUrlProvince(province, process.env.DISABILITY)
        let url2 = setUrlProvince(province, process.env.DISABILITY_SUMMARY)
        let response = await nepopulusFetch(url);
        let responseSummary = await nepopulusFetch(url2);

        if (!response || !response.data || !responseSummary || !responseSummary.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Disabiltiy of " + province + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "population_to_disability_ratio": responseSummary.data.total.percentage,
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "population_to_disability_ratio": responseSummary.data.male.percentage,
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "population_to_disability_ratio": responseSummary.data.female.percentage,
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        }

        return responseData;

    }catch(error){
        throw error;
    }
}

export async function getDisablityDataByDistrict(province, district){
    try{
        let url = setUrlProvinceAndDistrict(province, district, process.env.DISABILITY);
        let url2 = setUrlProvinceAndDistrict(province, district, process.env.DISABILITY_SUMMARY);
        let response = await nepopulusFetch(url);
        let responseSummary = await nepopulusFetch(url2);

        if (!response || !response.data || !responseSummary || !responseSummary.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Disability of " + district + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "population_to_disability_ratio": responseSummary.data.total.percentage,
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "population_to_disability_ratio": responseSummary.data.male.percentage,
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "population_to_disability_ratio": responseSummary.data.female.percentage,
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        }

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getDisablityDataByMunicipality(province, district, municipality){
    try{
        let url = setUrlProvinceDistrictAndMunicipality(province, district, municipality, process.env.DISABILITY);
        let url2 = setUrlProvinceDistrictAndMunicipality(province, district, municipality, process.env.DISABILITY_SUMMARY);
        let response = await nepopulusFetch(url);
        let responseSummary = await nepopulusFetch(url2);

        if (!response || !response.data || !responseSummary || !responseSummary.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Disability of " + municipality + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "population_to_disability_ratio": responseSummary.data.total.percentage,
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "population_to_disability_ratio": responseSummary.data.male.percentage,
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "population_to_disability_ratio": responseSummary.data.female.percentage,
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        }

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function generalMaritalData(){
    try{
        let response = await nepopulusFetch(process.env.MARITAL);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Marital Status overview listed successfully",
            "categories": response.data.categories,
            "total": {
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        }

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getMaritalDataByProvince(province){
    try{
        let url = setUrlProvince(province, process.env.MARITAL);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Marital Status of " + province + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        }

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getMaritalDataByDistrict(province, district){
    try{
        let url = setUrlProvinceAndDistrict(province, district, process.env.MARITAL);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Marital Status of " + district + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        };

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getMaritalDataByMunicipality(province, district, municipality){
    try{
        let url = setUrlProvinceDistrictAndMunicipality(province, district, municipality, process.env.MARITAL);
        let response = await nepopulusFetch(url);

        if(!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Marital Status of " + municipality + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        };

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function generalLivingArrangementData(){
    try{
        let response = await nepopulusFetch(process.env.LIVING_ARRANGEMENT);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Living Arrangement overview listed successfully",
            "categories": response.data.categories,
            "total": {
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        };

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getLivingArrangementDataByProvince(province){
    try{
        let url = setUrlProvince(province, process.env.LIVING_ARRANGEMENT);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Living Arrangement of " + province + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        };

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getLivingArrangementDataByDistrict(province, district){
    try{
        let url = setUrlProvinceAndDistrict(province, district, process.env.LIVING_ARRANGEMENT);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Living Arrangement of " + district + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        };

        return responseData;
    }catch(error){
        throw error;
    }
}

export async function getLivingArrangementDataByMunicipality(province, district, municipality){
    try{
        let url = setUrlProvinceDistrictAndMunicipality(province, district, municipality, process.env.LIVING_ARRANGEMENT);
        let response = await nepopulusFetch(url);

        if (!response || !response.data){
            throw {
                status: 404,
                message: 'Not Found'
            }
        }

        let responseData = {
            "status": 200,
            "message": "Data for Living Arrangement of " + municipality + " listed successfully",
            "categories": response.data.categories,
            "total": {
                "total": response.data.countSeries[0].total,
                "percentage_distribution": response.data.series[0].data,
                "count_distribution": response.data.countSeries[0].data,
            },
            "male": {
                "total": response.data.countSeries[1].total,
                "percentage_distribution": response.data.series[1].data,
                "count_distribution": response.data.countSeries[1].data,
            },
            "female": {
                "total": response.data.countSeries[2].total,
                "percentage_distribution": response.data.series[2].data,
                "count_distribution": response.data.countSeries[2].data,
            }
        };

        return responseData;
    }catch(error){
        throw error;
    }
}

getLivingArrangementDataByMunicipality('sudurpaschim', 'kanchanpur', 'beldandi gaunpalika').then((data) => console.log(data)).catch((error) => console.log(error));





