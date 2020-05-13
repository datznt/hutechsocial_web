<script>
export default {
  props: ["instance", "role"],
  data: () => ({}),
  computed:{
    reverseAddress(){
      return _.get(this.instance,'address.label')
    }
  }
};
</script>
<template>
  <div class="company-contact-wrapper">
    <b-card class="gedf-card" title="Liên hệ">
      <div class="card-table">
        <b-table-simple borderless responsive>
          <b-tbody>
            <b-tr>
              <b-th>Email</b-th>
              <b-td>{{instance.email}}</b-td>
            </b-tr>
            <b-tr>
              <b-th>Số điện thoại</b-th>
              <b-td>{{instance.phone}}</b-td>
            </b-tr>
            <b-tr v-if="reverseAddress">
              <b-th>Địa chỉ</b-th>
              <b-td>{{reverseAddress}}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>
    </b-card>
  </div>
</template>