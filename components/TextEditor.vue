<script>
import { Editor, EditorContent } from "tiptap";
import { Link, Placeholder } from "tiptap-extensions";
import client from "@/services/client";
import _ from "lodash";
import funcs from "@/utils/funcs";
export default {
  name: "text-editor",
  components: { EditorContent },
  props: {
    content: {
      type: String,
      default: ""
    },
    editable: {
      type: Boolean,
      default: false
    },
    classStyle: {
      type: String,
      default: ""
    },
    textInsertSelection: {
      type: String,
      default: ""
    }
  },
  watch: {
    newContent(newvalue) {
      this.$emit("onUpdate", newvalue);
    },
    textInsertSelection(newvalue) {
      if (newvalue) {
        const transaction = this.editor.state.tr.insertText(newvalue);
        this.editor.view.dispatch(transaction);
      }
    }
  },
  data() {
    return {
      newContent: "",
      editor: null
    };
  },
  mounted() {
    this.editor = new Editor({
      content: funcs.linkify(this.content),
      editable: this.editable,
      extensions: [
        new Link(),
        new Placeholder({
          emptyEditorClass: "is-editor-empty",
          emptyNodeClass: "is-empty",
          emptyNodeText: "Bạn đang nghĩ gì?",
          showOnlyWhenEditable: true,
          showOnlyCurrent: true
        })
      ],
      onUpdate: ({ getJSON, getHTML }) => {
        var data = this.planText(getHTML());
        if (data != null || data != undefined) {
          data = data.trim();
        }
        this.newContent = data;
      },
      onPaste: (view, event, slice) => {
        try {
          var data = event.clipboardData.getData("text/plain");
          this.emitEventPaste(data.trim());
        } catch (err) {
          console.log(err);
        }
      }
    });
  },
  methods: {
    planText(html) {
      if (!html) {
        return "";
      }
      var strHtml = html.toString();
      return strHtml.replace(/<\/?[^>]+>/gi, " ");
    },
    emitEventPaste(d) {
      this.$emit("onPaste", d);
      // detection link
      if (this.isLink(d)) this.linkExtraction(d);
    },
    isLink(link) {
      const re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
      try {
        var patt = new RegExp(re);
        return patt.test(link);
      } catch (err) {
        return false;
      }
    },
    async linkExtraction(link) {
      this.$emit("startExtractingLink", link);
      try {
        const { data, status } = await client.links("extract", {
          data: {
            link: link,
            create_by: _.get(this.$auth, "user.id")
          }
        });
        this.$emit("linkExtractionComplete", data);
      } catch (err) {
        console.log(err);
      }
      this.$emit("linkExtractionComplete", null);
    }
  },

  beforeDestroy() {
    this.editor.destroy();
  }
};
</script>
<template>
  <div :class="['editor',classStyle]">
    <client-only placeholder="Loading...">
      <editor-content class="editor__content" :editor="editor" />
    </client-only>
  </div>
</template>