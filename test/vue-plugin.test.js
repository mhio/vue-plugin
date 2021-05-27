import should from 'should'
import { mount, createLocalVue } from '@vue/test-utils'

import vuePlugin from '../src/vue.js'
import hljs from 'highlight.js/lib/core.js'
import js from 'highlight.js/lib/languages/javascript.js'
import xml from 'highlight.js/lib/languages/xml.js'

hljs.registerLanguage('javascript', js)
hljs.registerLanguage('xml', xml)

function debugWrapper(wrapper){
  for (const prop of ['language', 'autodetect', 'code', 'detectedLanguage', 'unknownLanguage']){
    console.debug(prop, wrapper.vm[prop])
  }
  console.log(wrapper.html())
}

describe('highlightjs/vue-plugin', function(){

  it('should render vuePlugin.component', async function(){
    const wrapper = mount(vuePlugin.component, {
      propsData: {
        code: 'console.log("Hello world")\nconst c = Cl.fun(2)',
      }
    })
    should.ok(wrapper.vm.detectedLanguage)
    wrapper.get('pre')
    wrapper.get('code')
    wrapper.get('span.hljs-string')
    wrapper.find('code').text().should.match(/Hello world/)
  })

  it('should render a component using vuePlugin.component', async function(){
    const TestComponent = Vue.component('TestComponent',{
      components: { highlightjs: vuePlugin.component },
      props: ['code'],
      template: '<div class="me"><highlightjs :code="code" /></div>',
    })

    const wrapper = mount(TestComponent, {
      propsData: {
        code: 'console.log("Below world")\nCl.fun(1)'
      }
    })

    wrapper.get('div.me')
    wrapper.get('pre')
    wrapper.get('code')
    wrapper.get('span.hljs-string')
    wrapper.find('code').text().should.match(/Below world/)
  })

  it('should install vuePlugin and render', async function(){
    const localVue = createLocalVue()
    localVue.use(vuePlugin)

    const InsComponent = localVue.component('InsComponent',{
      props: ['code'],
      template: '<highlightjs :code="code" />',
    })

    const wrapper = mount(InsComponent, {
      localVue,
      propsData: {
        code: 'console.log("Yellow world");\nCl.fun(2);\n'
      }
    })

    wrapper.get('pre')
    wrapper.get('code')
    wrapper.get('span.hljs-string')
    wrapper.find('code').text().should.match(/Yellow world/)
  })

  it('should highlight some autodetected code', async function(){
    const wrapper = mount(vuePlugin.component, {
      propsData: {
        code: 'console.log("Actual world")\nconst c = Cl.fun(2)',
        autodetect: true,
      }
    })

    should.ok(wrapper.vm.detectedLanguage)
    wrapper.get('span.hljs-string')
    wrapper.find('code').text().should.match(/Actual world/)
  })

  it('should highlight the specified language', async function(){
    const wrapper = mount(vuePlugin.component, {
      propsData: {
        code: 'const c = Cl.fun("Noxml world")',
        language: 'xml',
      }
    })

    should(wrapper.vm.detectedLanguage).equal('xml')
    wrapper.find('span.hljs-string').exists().should.be.false()
    wrapper.find('code').text().should.match(/Noxml world/)
  })

  it('should override a language with autodetect', async function(){
    const wrapper = mount(vuePlugin.component, {
      propsData: {
        code: 'console.log("Auto world")\nconst c = Cl.fun(2)',
        language: 'xml',
        autodetect: true,
      }
    })
    should.ok(wrapper.vm.detectedLanguage)
    wrapper.vm.detectedLanguage.should.not.equal('xml')
    wrapper.find('span.hljs-string').exists().should.be.true()
    wrapper.find('code').text().should.match(/Auto world/)
  })

})
