import builUrl from "@/plugins/build-url";
export default ({ app }, inject) => {
  inject('buildUrl', builUrl)
}