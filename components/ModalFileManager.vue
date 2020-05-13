<script>
import FormFileManager from "@/components/FormFileManager";
import _ from 'lodash';
export default {
  name: "modal-file-manager",
  components: { FormFileManager },
  props: {
    variant: {
      type: String,
      default: "primary"
    },
    styleClass: {
      type: String,
      default: null
    },
    content: {
      type: String,
      default: "files"
    },
    size: {
      type: String,
      default: "md"
    }
  },
  data: () => ({
    selectedItems: []
  }),
  created() {},
  methods: {
    onSelectChanged(d) {
      this.selectedItems = _.reduce(
        d,
        (arr, item) => {
          arr.push(item.data);
          return arr;
        },
        []
      );
    },
    okButtonHandler() {
      this.$bvModal.hide("modal-file-manager");
      this.$emit("selected", this.selectedItems);
    }
  }
};
</script>
<template>
  <b-button
    :variant="variant"
    :class="[styleClass]"
    :size="size"
    id="show-modal-file-manager"
    v-b-modal="'modal-file-manager'"
  >
    <span v-html="content"></span>
    <b-modal
      id="modal-file-manager"
      centered
      scrollable
      title="File manager"
      size="lg"
      body-class="p-0"
    >
      <form-file-manager :multiple-select="true" @select-changed="onSelectChanged"></form-file-manager>
      <template v-slot:modal-footer="{cancel}">
        <div class="w-100">
          <p class="float-left">Đã chọn {{selectedItems.length}} file</p>
          <div class="group-buttons float-right">
            <b-button variant="light" @click="cancel">Huỷ</b-button>
            <b-button variant="primary" @click="okButtonHandler">Ok</b-button>
          </div>
        </div>
      </template>
    </b-modal>
  </b-button>
</template>