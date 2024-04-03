import { useState } from "react";
import Title from "./Title";
import Uik from "../../ui-kit";
import {
  AccountCreationData,
  Network,
  Extension,
} from "../../ui-kit/components/organisms/AccountSelector/AccountSelector";
import MetaMaskIcon from "./MetaMaskIcon";
import ReefIcon from "../../ui-kit/components/assets/ReefIcon";
import ReefSign from "../../ui-kit/components/assets/ReefSign";

const availableExtensions: Extension[] = [
  {
    name: "reef",
    displayName: "Browser extension",
    link: "https://chrome.google.com/webstore/detail/reefjs-extension/mjgkpalnahacmhkikiommfiomhjipgjn",
    selected: true,
    installed: true,
    icon: <ReefIcon />,
  },
  {
    name: "reef-snap",
    displayName: "MetaMask Snap",
    link: "local:http://localhost:8080",
    selected: false,
    installed: true,
    icon: <MetaMaskIcon />,
    isSnap: true,
  },
  {
    name: "reef-easy",
    displayName: "Easy wallet",
    link: "local:http://localhost:8080",
    selected: false,
    installed: false,
    icon: <ReefSign />,
  },
];

const accounts = [
  {
    name: "Test Account 1",
    address: "5CSJtNRJHEazGS4xs5PvmRddTb5xGSwLkhQcs7KAyHAdshpY",
    evmAddress: "0x8Cc9EB01a8B68696768dB0b8D5C6dDF8dE467523",
  },
  {
    name: "Test Account 2",
    address: "5HW5AhtsiFhqN6K2TfZHmanh9kboyuLrCddWpNtBuu2XzVPc",
    evmAddress: "0x9f704566B7A3725f05A434959bA69e97B73c5B66",
    isEvmClaimed: false,
  },
  {
    name: "Test Account 3",
    address: "5HKbc94LpExjJQNxKikDM2tyGGt8C9QH1JU96exfHXGGAZ8D",
    evmAddress: "0xAd6f307aCedB1D56fB8B8660861CA1b25592b4A2",
  },
];

function Example() {
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState(accounts[0]);
  const [availableAccounts, setAvailableAccounts] = useState(accounts);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>("mainnet");
  const [selectedExtensionName, setSelectedExtensionName] = useState(
    availableExtensions[0].name
  );

  const selectExtension = (name: string) => {
    setSelectedExtensionName(name);
    
    if (name === "reef") {
      setAvailableAccounts(accounts);
    } else {
      setAvailableAccounts([accounts[0]]);
    }
  };

  const selectAccount = (account) => {
    setSelected(account);
    setOpen(false);
  };

  const generateAccount = (): Promise<AccountCreationData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          address: "5Reef1234Reef1234Reef1234Reef1234Reef1234Reef123",
          seed: "test test test test test test test test test test test test",
        });
      }, 2000);
    });
  };

  return (
    <>
      <Title text="Account Selector" code={code} />

      <Uik.Button
        size="large"
        text="Select Account"
        fill
        onClick={() => setOpen(true)}
      />

      <Uik.AccountSelector
        isOpen={isOpen}
        accounts={availableAccounts}
        availableExtensions={availableExtensions}
        selExtName={selectedExtensionName}
        selectedAccount={selected}
        availableNetworks={["mainnet", "testnet"]}
        selectedNetwork={selectedNetwork}
        onExtensionSelect={(id: string) => selectExtension(id)}
        onClose={() => setOpen(false)}
        onSelect={(account) => selectAccount(account)}
        onImport={() => {}}
        onNetworkSelect={setSelectedNetwork}
        onLanguageSelect={console.log}
        onUpdateMetadata={(network) =>
          console.log(`Update metadata for ${network}`)
        }
        onStartAccountCreation={generateAccount}
        onConfirmAccountCreation={(seed, name) =>
          console.log(`New account ${name}, seed: ${seed}`)
        }
        onRename={(address, newName) =>
          console.log(`Rename account ${address} to ${newName}`)
        }
        onExport={(address, password) => console.log(`Export account ${address} with password ${password}`)}
        onForget={(address) => console.log(`Forget account ${address}`)}
        showSnapOptions={true}
      />
    </>
  );
}

const code = `const accounts = [
  {
    name: "Test Account 1",
    address: "5CSJtNRJHEazGS4xs5PvmRddTb5xGSwLkhQcs7KAyHAdshpY",
    evmAddress: "0x8Cc9EB01a8B68696768dB0b8D5C6dDF8dE467523"
  },
  {
    name: "Test Account 2",
    address: "5HW5AhtsiFhqN6K2TfZHmanh9kboyuLrCddWpNtBuu2XzVPc",
    evmAddress: "0x9f704566B7A3725f05A434959bA69e97B73c5B66"
  },
  {
    name: "Test Account 3",
    address: "5HKbc94LpExjJQNxKikDM2tyGGt8C9QH1JU96exfHXGGAZ8D",
    evmAddress: "0xAd6f307aCedB1D56fB8B8660861CA1b25592b4A2"
  }
]

const [isOpen, setOpen] = useState(false)
const [selected, setSelected] = useState(accounts[0])

const selectAccount = account => {
  setSelected(account)
  setOpen(false)
}

<>      
  <Uik.Button
    size="large"
    text="Select Account"
    fill
    onClick={() => setOpen(true)}
  />

  <Uik.AccountSelector
    isOpen={isOpen}
    accounts={accounts}
    selectedAccount={selected}
    onClose={() => setOpen(false)}
    onSelect={account => selectAccount(account)}
  />
</>`;

export default Example;
