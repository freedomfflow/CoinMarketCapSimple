/*
 *  Main js file for retrieving API data from Coin Gecko & managing events  pagination
 */

/* Global Vars */
var validEndpoints = {global: '/global', coin_list: '/coins/markets'}
var validChangePeriods = ['1h', '24h', '7d'];

$(document).ready(() => {
    $("body").delegate('.page-link', "click", (e) => {
        e.preventDefault();
        let pageNbr = 1;
        let whichPage = e.target.id;
        if (whichPage === 'custom') {
            pageNbr = parseInt($('#custom-page').val());
        } else {
            pageNbr = parseInt(whichPage);
        }

        sessionStorage.setItem("pageNumber", pageNbr);
        refreshData();

        // $('.overlay').show();
    });

    $('#coinlist-tab').click(() => {
        $('.pag-nav-li').show();
    });

    $('#exchange-tab').click(() => {
        $('.pag-nav-li').hide();
    });

    initialize();
});

/* Base function for making API call */
const getData = async (params) => {
    // Valid Endpoint label must be present
    if (!params.hasOwnProperty('endPoint')) {
        alert("Invalid Request - Endpoint not found");
        return false;
    }
    let QS = '';
    if (params.endPoint === 'coin_list') {
        pageNbr = (sessionStorage.getItem('pageNumber')) ? parseInt(sessionStorage.getItem('pageNumber')) : 1;
        periods = validChangePeriods.toString();
        QS = '?vs_currency=usd&order=market_cap_desc&per_page=100&page=' + pageNbr + '&sparkline=false&price_change_percentage=' + periods;
    }
    let BASE_URL = 'https://api.coingecko.com/api/v3';
    let ENDPOINT = validEndpoints[params.endPoint];
    let apiUrl = BASE_URL + ENDPOINT + QS;

    try {
        return await $.get(apiUrl);
    } catch (error) {
        console.log('ERROR MAKING API CALL');
    }
}

/* Get global api data for header info and pagination total */
const getGlobalData = async () => {
    return await getData({endPoint: 'global'});
}

/* Get 100 coins for display */
const getCoinList = async () => {
    let pageNbr = sessionStorage.getItem('pageNumber')
    pageNbr = pageNbr ? pageNbr : 1;
    let result = await getData({endPoint: 'coin_list', pageNbr: pageNbr});
    await buildCoinList(result);
}

/* Configure Pagination */
const getPagination = () => {
    /* Set up pagination navigation based on where we are now */
    let currentPage = sessionStorage.getItem('pageNumber');
    let prevPage = (parseInt(currentPage) - 1) > 0 ? parseInt(currentPage) - 1 : 1;
    let lastPage = sessionStorage.getItem('lastPageNumber');
    let secondPage = (parseInt(currentPage) + 1) < 74 ? (parseInt(currentPage) + 1) : 73;
    let thirdPage = (parseInt(currentPage) + 2) < 74 ? (parseInt(currentPage) + 2) : 74;
    let pagination = '<nav> <ul class="pagination"> ';
    pagination += '<li class="page-item"><a class="page-link" href="#" id="' + prevPage + '">Previous</a></li>';
    pagination += '<li class="page-item"><a class="page-link" href="#" id="1">1</a></li>';
    pagination += '<li class="page-item"><a class="page-link" href="#" id="' + secondPage + '">' + secondPage + '</a></li>';
    pagination += '<li class="page-item"><a class="page-link" href="#" id="' + thirdPage + '">' + thirdPage + '</a></li>';
    pagination += '<li class="page-item">';
    pagination += ' <div class="input-group mb-3"><input class="form-control" id="custom-page" type="number" min="1" max="' + parseInt(lastPage) + '" placeholder="nbr?">';
    pagination += '   <div class="input-group-append"><a class="page-link input-group-text" href="#" id="custom">Jump To</a>';
    pagination += ' </div></div>'
    pagination += '</li>';
    pagination += '<li class="page-item"><a class="page-link" href="#" id="' + (parseInt(lastPage) - 2) + '">' + (parseInt(lastPage) - 2) + '</a></li>';
    pagination += '<li class="page-item"><a class="page-link" href="#" id="' + (parseInt(lastPage) - 1) + '">' + (parseInt(lastPage) - 1) + '</a></li>';
    pagination += '<li class="page-item"><a class="page-link" href="#" id="' + (parseInt(currentPage) + 1) + '">Next</a></li>';
    pagination += '</ul> </nav>';

    $('.pagination-nav').html(pagination);
}

/* Format coin list api data into html for rendering */
function buildCoinList(data) {
    $.each(data, function (i, dict) {
        let rank = dict.market_cap_rank;
        let img_url = dict.image;
        let name = dict.name;
        let market_cap = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(dict.market_cap);
        let price = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(dict.current_price);
        let total_volume = new Intl.NumberFormat('en-US').format(dict.total_volume);
        let circulating_supply = new Intl.NumberFormat('en-US').format(dict.circulating_supply);
        let pct_change = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
        }).format(dict.price_change_percentage_24h);

        pct_change = pct_change > 0 ? '<span style="color: green;">' + pct_change + '</span>' : '<span style="color: red;">' + pct_change + '</span>';

        let formatted_row = '';
        formatted_row = '<div class="col-12"><div class="row crypto-row">';
        formatted_row += '<div class="col-1">' + rank + '</div>';
        formatted_row += '<div class="col-2"><span class="icon-image"><img src="' + img_url + '" width="20px"></span>&nbsp;&nbsp;' + name + '</div>';
        formatted_row += '<div class="col-2 nbr-cell">' + market_cap + '</div>';
        formatted_row += '<div class="col-1 nbr-cell">' + price + '</div>';
        formatted_row += '<div class="col-2 nbr-cell">' + total_volume + '</div>';
        formatted_row += '<div class="col-2 nbr-cell">' + circulating_supply + '</div>';
        formatted_row += '<div class="col-2 nbr-cell">' + pct_change + '</div></div></div>';
        formatted_row += '<hr>';
        $('.data-row').append(formatted_row);
    });
}

/* Whenever we click on a nav link to get more data, we need to refersh and fetch */
async function refreshData() {
    $('.pagination-nav').html('');
    $('.data-row').html('');
    getPagination();
    await getCoinList()
}

/* Run when document is ready */
async function initialize() {
    /*
     * We store total nbr of coins in local storage
     *  if that is not present, then we want to get global data
     *  otherwise, we do not need global data again
     */

    if (null == sessionStorage.getItem('totalCoinCount')) {
        let globals = await getGlobalData();
        /* save some of the global data so we have it and only make this call once per session */
        sessionStorage.setItem("totalCoinCount", globals.data.active_cryptocurrencies);
        sessionStorage.setItem("totalMarketCount", globals.data.markets);
        sessionStorage.setItem("marketCapChange24h", globals.data.market_cap_change_percentage_24h_usd);
        sessionStorage.setItem("pageNumber", 1);
        sessionStorage.setItem("lastPageNumber", Math.floor(globals.data.active_cryptocurrencies/100));
    }

    $("#total-coins").html(sessionStorage.getItem('totalCoinCount'));
    $("#total-markets").html(sessionStorage.getItem('totalMarketCount'));
    $("#market-cap-change").html(parseFloat(sessionStorage.getItem('marketCapChange24h')).toFixed(2) + '%');

    await refreshData();
}
