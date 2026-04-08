import {
  FileText,
  Building,
  HelpCircle,
  Building2,
  QrCodeIcon,
  DoorClosed,
  Printer,
} from 'lucide-react'
import { type SidebarData } from '../types'

const IssuesIcon = () => (
  <svg
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 5.5C20 5.23478 19.8946 4.98051 19.707 4.79297C19.5195 4.60543 19.2652 4.5 19 4.5L5 4.5C4.73478 4.5 4.48051 4.60543 4.29297 4.79297C4.10543 4.98051 4 5.23478 4 5.5L4 19.0859L6.29297 16.793L6.36621 16.7266C6.54417 16.5807 6.76791 16.5 7 16.5L19 16.5C19.2652 16.5 19.5195 16.3946 19.707 16.207C19.8946 16.0195 20 15.7652 20 15.5L20 5.5ZM22 15.5C22 16.2957 21.6837 17.0585 21.1211 17.6211C20.5585 18.1837 19.7957 18.5 19 18.5L7.41406 18.5L3.70703 22.207C3.42103 22.493 2.99086 22.5786 2.61719 22.4238C2.24359 22.269 2 21.9044 2 21.5L2 5.5C2 4.70435 2.3163 3.94152 2.87891 3.37891C3.44152 2.8163 4.20435 2.5 5 2.5L19 2.5C19.7956 2.5 20.5585 2.8163 21.1211 3.37891C21.6837 3.94152 22 4.70435 22 5.5L22 15.5Z"
      fill="currentColor"
    />
    <path
      d="M11 9.5V7.5C11 6.94772 11.4477 6.5 12 6.5C12.5523 6.5 13 6.94772 13 7.5V9.5C13 10.0523 12.5523 10.5 12 10.5C11.4477 10.5 11 10.0523 11 9.5Z"
      fill="currentColor"
    />
    <path
      d="M12.0098 12.5L12.1123 12.5049C12.6165 12.5561 13.0098 12.9822 13.0098 13.5C13.0098 14.0178 12.6165 14.4439 12.1123 14.4951L12.0098 14.5H12C11.4477 14.5 11 14.0523 11 13.5C11 12.9477 11.4477 12.5 12 12.5H12.0098Z"
      fill="currentColor"
    />
  </svg>
)

const BoardIcon = () => (
  <svg
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.46 4.78L2.53999 4.78L2.53999 9.94L21.46 9.94V4.78Z"
      stroke="currentColor"
      strokeWidth="2.064"
      strokeMiterlimit="10"
      strokeLinecap="square"
    />
    <path
      d="M2.53999 15.07L21.46 15.07"
      stroke="currentColor"
      strokeWidth="2.064"
      strokeMiterlimit="10"
      strokeLinecap="square"
    />
    <path
      d="M2.53999 20.21L21.46 20.21"
      stroke="currentColor"
      strokeWidth="2.064"
      strokeMiterlimit="10"
      strokeLinecap="square"
    />
  </svg>
)

const TasksIcon = () => (
  <svg
    className="w-6 h-6"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 12C20 9.87827 19.1575 7.84306 17.6572 6.34277C16.1574 4.84294 14.123 4.00052 12.0019 4C9.7446 4.00896 7.57806 4.88999 5.95506 6.45898L3.70702 8.70703C3.31649 9.09756 2.68348 9.09756 2.29295 8.70703C1.90243 8.31651 1.90243 7.68349 2.29295 7.29297L4.55272 5.0332L4.94627 4.66992C6.89241 2.96203 9.39523 2.00982 11.9961 2H12L12.4961 2.0127C14.9676 2.13537 17.3132 3.17061 19.0713 4.92871C20.9466 6.80407 22 9.34784 22 12C22 12.5523 21.5523 13 21 13C20.4477 13 20 12.5523 20 12Z"
      fill="currentColor"
    />
    <path
      d="M2 3C2 2.44772 2.44772 2 3 2C3.55228 2 4 2.44772 4 3V7H8C8.55228 7 9 7.44772 9 8C9 8.55228 8.55228 9 8 9H3C2.44772 9 2 8.55228 2 8V3Z"
      fill="currentColor"
    />
    <path
      d="M2 12C2 11.4477 2.44772 11 3 11C3.55228 11 4 11.4477 4 12C4 14.1217 4.84248 16.1569 6.34277 17.6572C7.84237 19.1568 9.8764 19.9982 11.9971 19.999C14.2548 19.9903 16.4217 19.1102 18.0449 17.541L20.293 15.293C20.6835 14.9024 21.3165 14.9024 21.707 15.293C22.0976 15.6835 22.0976 16.3165 21.707 16.707L19.4473 18.9668L19.0537 19.3301C17.1076 21.038 14.6048 21.9902 12.0039 22H12C9.34784 22 6.80407 20.9467 4.92871 19.0713C3.05335 17.1959 2 14.6522 2 12Z"
      fill="currentColor"
    />
    <path
      d="M20 21V17H16C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15H21L21.1025 15.0049C21.6067 15.0562 22 15.4823 22 16V21C22 21.5523 21.5523 22 21 22C20.4477 22 20 21.5523 20 21Z"
      fill="currentColor"
    />
  </svg>
)

const InsightsIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <g>
      <path fill="none" d="M0 0H24V24H0z" />
      <path d="M5 3v16h16v2H3V3h2zm15.293 3.293l1.414 1.414L16 13.414l-3-2.999-4.293 4.292-1.414-1.414L13 7.586l3 2.999 4.293-4.292z" />
    </g>
  </svg>
)

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/avatars/default.jpg',
  },
  teams: [
    {
      name: 'Main Organization',
      logo: Building2,
      plan: 'Enterprise',
    },
  ],
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Issues',
          url: '/dashboard',
          icon: IssuesIcon,
          permission: 'issues',
        },
        {
          title: 'Board',
          url: '/dashboard/board',
          icon: BoardIcon,
          permission: 'board',
        },
       /*  {
          title: 'Tasks',
          url: '/dashboard/tasks',
          icon: TasksIcon,
          permission: 'tasks',
        }, */
        {
          title: 'Spaces',
          url: '/dashboard/spaces',
          icon: DoorClosed,
          permission: 'spaces',
        },
        {
          title: 'Assets',
          url: '/dashboard/assets',
          icon: Printer,
          permission: 'assets',
        },
        {
          title: 'Documents',
          url: '/dashboard/documents',
          icon: FileText,
          permission: 'documents',
        },
        {
          title: 'Insights',
          url: '/dashboard/insights',
          icon: InsightsIcon,
          permission: 'insights',
        },
        {
          title: 'QR Codes',
          url: '/dashboard/qr-codes',
          icon: QrCodeIcon,
          permission: 'qrCodes',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Organisation',
          url: '/dashboard/organisation',
          icon: Building,
          permission: 'organisation',
        },
        {
          title: 'Help',
          url: '/dashboard/help',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
