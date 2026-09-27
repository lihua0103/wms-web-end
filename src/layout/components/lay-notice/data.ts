import { $t } from "@/plugins/i18n";

export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: "primary" | "success" | "warning" | "info" | "danger";
  extra?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
  emptyText: string;
}

export const noticesData: TabItem[] = [
  {
    key: "1",
    name: $t("notice.tab.notify"),
    list: [],
    emptyText: $t("notice.tab.notifyEmpty")
  },
  {
    key: "2",
    name: $t("notice.tab.message"),
    list: [
      {
        avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile1.svg",
        title: $t("notice.list.commentTitle"),
        description: $t("notice.list.commentDesc"),
        datetime: $t("notice.list.today"),
        type: "2"
      },
      {
        avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile2.svg",
        title: $t("notice.list.replyTitle"),
        description: $t("notice.list.replyDesc"),
        datetime: $t("notice.list.yesterday"),
        type: "2"
      },
      {
        avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile5.svg",
        title: $t("notice.list.longTitle"),
        description: $t("notice.list.longDesc"),
        datetime: $t("notice.list.time"),
        type: "2"
      }
    ],
    emptyText: $t("notice.tab.messageEmpty")
  },
  {
    key: "3",
    name: $t("notice.tab.todo"),
    list: [
      {
        avatar: "",
        title: $t("notice.list.emergencyTitle"),
        description: $t("notice.list.emergencyDesc"),
        datetime: "",
        extra: $t("notice.list.dueSoon"),
        status: "danger",
        type: "3"
      },
      {
        avatar: "",
        title: $t("notice.list.releaseTitle"),
        description: $t("notice.list.releaseDesc"),
        datetime: "",
        extra: $t("notice.list.elapsedDays"),
        status: "warning",
        type: "3"
      },
      {
        avatar: "",
        title: $t("notice.list.devTitle"),
        description: $t("notice.list.devDesc"),
        datetime: "",
        extra: $t("notice.list.inProgress"),
        type: "3"
      },
      {
        avatar: "",
        title: $t("notice.list.taskTitle"),
        description: $t("notice.list.taskDesc"),
        datetime: "",
        extra: $t("notice.list.notStarted"),
        status: "info",
        type: "3"
      }
    ],
    emptyText: $t("notice.tab.todoEmpty")
  }
];
