import { $s } from '../../locales/index';

type Input = string | true;

type Tab = {
  label: string;
  icon?: string;
  topicon?: string;
  input?: Input;
};

const tabs: Record<string, Record<string, Tab>> = {
  bottom: {
    service: {
      label: $s.tabs.service,
      icon: 'icon-service',
      topicon: 'icon-search',
      input: true,
    },
    product: {
      label: $s.tabs.product,
      icon: 'icon-product',
      topicon: 'icon-search',
      input: true,
    },
  },
};

export default tabs;
