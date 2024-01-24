import template from 'art-template/lib/template-web';
import Swiper from 'swiper';
let eventDom = [];
let options = {};
let logBaseUrl = '';
import $ from 'jquery';
import './core/style.css';
import 'swiper/dist/css/swiper.min.css'
import { httpRequest } from './core/http';
export default async function init(n){
if (Array.isArray(n)) {
        n.forEach((option) => {
            webInit(option)
        })
    } else {
        webInit(n);
    }
}

export async function webInit(option) {
  options = option;
  const regService = /(dev|test)/gi;
  const baseUrl = regService.test(window.location.href) ? 'http://test-ad-interface.m2.com.cn/api/getads' : 'https://ad-interface.m2.com.cn/api/getads';
  logBaseUrl = regService.test(window.location.href) ? 'http://test-ad-interface.m2.com.cn/api/mediaFncode/buryPointList' : 'https://ad-interface.m2.com.cn/api/mediaFncode/buryPointList'
  if (!eventDom.includes(option.node)) {
    eventDom.push(option.node)
  }
  let params = {
    data: {
      mediaCode: option.mediaCode,
      spaceCode: option.spaceCode
     },
    method: 'POST',
    url: baseUrl
  }
  if (option.data) {
    params.data['queryParams'] = JSON.stringify(option.data)
  }
  const regSpaceCode = ['m2_supplier_banner','m2_supply_banner', 'green_build_index_banner']
  const re = await httpRequest(params)
  const { statusCode, data } = re
  if (statusCode === 200) {
    if (data.sdkTemplate) {
      insertJsCOntent(data, option.node, () => {
        if (regSpaceCode.includes(option.spaceCode) || (option.showType && option.showType === 'multiple' )) {
          initSwiper(option)
        }
      })
    }
  }
  bindDomEvent(data.adList, option)
}

export async function initSwiper(option) {
    const swiperLen = $('body').find('.swiper-container').length
    if (!swiperLen) {
      return
    }
    let obj = {}
    if (option.arrow) {
      obj = {
        loop: true,
        autoplay: 2000,
        spaceBetween: 30,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
      }
      if(option.effect) {
        obj.effect = 'fade'
      }
    } else {
      obj = {
        pagination: '.swiper-pagination',
        loop: true,
        paginationClickable: true,
        autoplay: 2000,
        spaceBetween: 30
      }
      if(option.effect) {
        obj.effect = 'fade'
      }
    }
    const swiper = new Swiper('.swiper-container', obj)
    /*鼠标移入停止轮播，鼠标离开 继续轮播*/
    // 判断swiper是否
    $('body').on('mouseenter','.swiper-container', () => {
      swiper.stopAutoplay();
    })
    .on('mouseleave','.swiper-container', () => {
      swiper.startAutoplay();
    })
  }

export async function bindDomEvent(data, option) {
  // 渲染添加埋点
  // 根据返回数据做埋点统计
  let mitoList = []
  Array.isArray(data) && data.forEach((o) => {
    let obj = {
      adCode: o.adCode,
      advertiserId: o.advertiserId,
      fncode: o.showFncode
    }
    if (option.data) {
      obj['queryParams'] = JSON.stringify(option.data);
    }
    mitoList.push(obj)
  })
  const searchParams = {
    data: JSON.stringify(mitoList),
    method: 'POST',
    dataType: 'application/json',
    url: logBaseUrl
  }
  httpRequest(searchParams)
  // 点击添加埋点
  $('body').off('click.mito').on('click.mito', '.mito-event', (e) => {
    // e.stopPropagation()
    // e.preventDefault()
    const $parent = $(e.target).parents('.mito-event')
    // 根据点击的元素获取当前的埋点元素
    if ($parent.attr('class').includes('mito-event')) {
      const clickfncode = $parent.attr('clickfncode')
      const adCode = $parent.attr('adCode')
      const advertiserId = $parent.attr('advertiserId')
      const reData = {
        adCode: adCode,
        advertiserId: advertiserId,
        fncode: clickfncode
      }
      if (option.data) {
        reData['queryParams'] = JSON.stringify(option.data);
      }
      const params = {
        data: JSON.stringify([reData]),
        method: 'POST',
        dataType: 'application/json',
        url: logBaseUrl
      }
       httpRequest(params).then((re) => {
         console.log(re, 9999)
       })
    }
  }).
  off('click.close').on('click.close', '.modal-close', (e) => {
    document.getElementById(`${options.node}`).innerHTML = '';
    option.callback && option.callback('close')
  })
}

export async function insertJsCOntent(art, node, callback) {
    // if (Array.isArray(art.adList) && art.adList.length) {
    //   const html = render(art);
    //   document.getElementById(`${node}`).innerHTML = html;
    // }
    if (art.sdkTemplate.templateContent) {
      const tem = await template.render(art.sdkTemplate.templateContent, art)
      document.getElementById(`${node}`).innerHTML = tem;
      setTimeout(() => {
        callback && callback()
      }, 500)
    }
  }