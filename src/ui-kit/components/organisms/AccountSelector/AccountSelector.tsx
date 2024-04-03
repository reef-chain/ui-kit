import { useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

import Icon from "./../../atoms/Icon";
import {
  faCircleInfo,
  faGlobe,
  faWarning,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AccountComponent from "./Account";
import Tabs from "../../atoms/Tabs";
import Dropdown from "../../atoms/Dropdown/Dropdown";
import DropdownItem from "../../atoms/Dropdown/DropdownItem";
import Button from "../../atoms/Button";
import { localizedStrings as strings } from "../../../l10n/l10n";
import Input from "../../atoms/Input";
import Tooltip from "../../atoms/Tooltip";
import Loading from "../../atoms/Loading";
import CopyButton from "../CopyButton";
import Text from "../../atoms/Text";
import Form from "../../atoms/Form";
import Label from "../../atoms/Label";
import Checkbox from "../../atoms/Checkbox";
import Tag from "../../atoms/Tag";

export type Extension = {
  name: string;
  displayName: string;
  link: string;
  selected: boolean;
  installed: boolean;
  isSnap?: boolean;
  icon?: JSX.Element;
};

export type Account = {
  name?: string;
  address: string;
  evmAddress?: string;
  source?: string;
  isEvmClaimed?: boolean;
};

export type Network = "mainnet" | "testnet";
export type Language = "en" | "hi";

export interface AccountCreationData {
  address: string;
  seed: string;
}

enum ImportState {
  NONE,
  SEED,
  JSON,
}

export interface Props {
  isOpen: boolean;
  availableExtensions?: Extension[];
  selExtName?: string;
  accounts?: Account[];
  selectedAccount?: Account | null | undefined;
  selectedNetwork?: Network;
  availableNetworks?: Network[];
  showSnapOptions?: boolean;
  onClose?: (...args: any[]) => any;
  onExtensionSelect?: (name: string) => any;
  onSelect?: (...args: any[]) => any;
  onRename?: (address: string, newName: string) => any;
  onExport?: (address: string, password: string) => any;
  onImport?: (...args: any[]) => any;
  onForget?: (address: string) => any;
  onNetworkSelect?: (network: Network) => any;
  onLanguageSelect?: (language: Language) => any;
  onUpdateMetadata?: (network: Network) => any;
  onStartAccountCreation?: () => Promise<AccountCreationData>;
  onConfirmAccountCreation?: (seed: string, name: string) => any;
  className?: string;
}

function AccountSelector({
  isOpen,
  availableExtensions,
  selExtName,
  accounts,
  selectedAccount,
  availableNetworks,
  selectedNetwork,
  showSnapOptions,
  onExtensionSelect,
  onClose,
  onSelect,
  onRename,
  onExport,
  onImport,
  onForget,
  onNetworkSelect,
  onLanguageSelect,
  onUpdateMetadata,
  onStartAccountCreation,
  onConfirmAccountCreation,
  className,
}: Props): JSX.Element => {
  const wrapper = useRef(null);

  const isSelected = (account: Account): boolean => {
    return (
      !!selectedAccount?.address &&
      account.address === selectedAccount.address &&
      account.source === selectedAccount.source
    );
  };

  const select = (account: Account) => {
    if (onSelect) onSelect(account);
  };

  const opened = () => (document.body.style.overflow = "hidden");
  const closed = () => (document.body.style.overflow = "");

  const [isExtensionDropdownOpen, setExtensionDropdown] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdown] = useState(false);
  const [isCreateDropdownOpen, setCreateDropdown] = useState(false);
  const [isImportDropdownOpen, setImportDropdown] = useState(false);
  const [extensions, setExtensions] = useState<Extension[]>();
  const [selectedExtension, setSelectedExtension] = useState<Extension>();
  const [accountCreationData, setAccountCreationData] =
    useState<AccountCreationData>();
  const [seedSaved, setSeedSaved] = useState(false);
  const [newName, setNewName] = useState("");
  const [password, setPassword] = useState("");
  const [submittedWithError, setSubmittedWithError] = useState(false);
  const [importState, setImportState] = useState(ImportState.NONE);
  const [importSeed, setImportSeed] = useState("");
  const [importJson, setImportJson] = useState("");

  useEffect(() => {
    if (availableExtensions?.length) {
      const selectedName = selExtName || availableExtensions[0].name;
      const updatedExtensions = availableExtensions.map((extension) => ({
        ...extension,
        selected: extension.name === selectedName,
      }));
      const selected = updatedExtensions.find((extension) => extension.selected);
      setExtensions(updatedExtensions);
      setSelectedExtension(selected);
    } else {
      setExtensions([]);
      setSelectedExtension(undefined);
    }
  }, [availableExtensions, selExtName]);

  const onExtensionClick = (extension: Extension) => {
    if (extension.selected) return;
    if (!extension.installed) {
      window.location.href = extension.link;
      return;
    }
    onExtensionSelect(extension.name);
  };

  const closeAccountCreation = () => {
    setAccountCreationData(undefined);
    setNewName("");
    setSubmittedWithError(false);
    setSeedSaved(false);
    setCreateDropdown(false);
  };

  const onCreateClick = () => {
    if (newName?.length > 2 && seedSaved) {
      onConfirmAccountCreation(accountCreationData.seed, newName);
      closeAccountCreation();
    } else {
      setSubmittedWithError(true);
    }
  };

  const closeAccountImport = () => {
    setImportState(ImportState.NONE);
    setNewName("");
    setPassword("");
    setImportSeed("");
    setImportJson("");
    setSubmittedWithError(false);
    setImportDropdown(false);
  };

  const onImportClick = () => {
    if (importState === ImportState.SEED) {
      if (!validSeed() || !(newName?.length > 2)) {
        setSubmittedWithError(true);
        return;
      } else {
        onImport({ name: newName, seed: importSeed });
        closeAccountImport();
      }
    } else if (importState === ImportState.JSON) {
      if (!validJson() || !password.length) {
        setSubmittedWithError(true);
        return;
      } else {
        onImport({ json: importJson, password });
        closeAccountImport();
      }
    }
  };

  const validSeed = () => {
    return (
      importSeed &&
      (importSeed.trim().split(/\s+/).length === 12 ||
        importSeed.trim().split(/\s+/).length === 24)
    );
  };

  const validJson = () => {
    try {
      JSON.parse(importJson);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div
      className={`
        uik-account-selector
        ${className || ""}
      `}
    >
      <CSSTransition
        in={isOpen}
        className="uik-account-selector__wrapper"
        nodeRef={wrapper}
        timeout={500}
        unmountOnExit
        onEnter={opened}
        onExited={closed}
      >
        <div ref={wrapper} className="uik-account-selector__wrapper">
          <div className="uik-account-selector__content">
            <div className="uik-account-selector__head">
              {!!extensions &&
              !!extensions.length &&
              !!onExtensionSelect ? (
                <div className="uik-account-selector__extension">
                  <Button
                    size="large"
                    fill
                    onClick={() => setExtensionDropdown(true)}
                  >
                    <span>{selectedExtension?.displayName}</span>
                    {selectedExtension?.icon && selectedExtension.icon}
                  </Button>
                  <Dropdown
                    isOpen={isExtensionDropdownOpen}
                    onClose={() => setExtensionDropdown(false)}
                    position="bottomRight"
                    className="uik-account-selector__extension-dropdown"
                  >
                    {extensions.map((extension, index) => (
                      <DropdownItem
                        key={index}
                        onClick={() => onExtensionClick(extension)}
                        className="uik-account-selector__extension-item"
                      >
                        <span>{extension.displayName}</span>
                        {extension.icon && extension.icon}
                        {extension.selected ? (
                          <Tag color="green" text={strings.selected} />
                        ) : extension.installed ? (
                          <Tag color="orange" text={strings.select} />
                        ) : (
                          <Tag color="red" text={strings.install} />
                        )}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </div>
              ) : (
                <div className="uik-account-selector__title">
                  {strings.select_account}
                </div>
              )}

              {!!onLanguageSelect && (
                <div className="uik-account-selector__language">
                  <Button
                    text={strings.choose_language}
                    size="large"
                    onClick={() => setLanguageDropdown(true)}
                  />
                  <div className="uik-account-selector__language_dropdown_av">
                    <Dropdown
                      isOpen={isLanguageDropdownOpen}
                      onClose={() => setLanguageDropdown(false)}
                    >
                      <DropdownItem
                        icon={faGlobe}
                        text="English"
                        onClick={() => {
                          onLanguageSelect("en");
                          strings.setLanguage("en");
                        }}
                      />
                      <DropdownItem
                        icon={faGlobe}
                        text="Hindi"
                        onClick={() => {
                          onLanguageSelect("hi");
                          strings.setLanguage("hi");
                        }}
                      />
                    </Dropdown>
                  </div>
                </div>
              )}

              {!!selectedNetwork && !!onNetworkSelect && (
                <Tabs
                  className="uik-account-selector__network"
                  value={selectedNetwork}
                  options={availableNetworks.map((val) => {
                    return { value: val, text: strings[val] };
                  })}
                  onChange={onNetworkSelect}
                />
              )}

              <button
                className="uik-account-selector__close-btn"
                type="button"
                onClick={onClose}
              >
                <Icon
                  className="uik-account-selector__close-btn-icon"
                  icon={faXmark}
                />
              </button>
            </div>

            {!!showSnapOptions &&
              (!extensions || selectedExtension?.isSnap) && (
                <div className="uik-account-selector__snap-management">
                  {onStartAccountCreation && onConfirmAccountCreation && (
                    <>
                      <Button
                        text={strings.create_account}
                        size="large"
                        onClick={() => {
                          setCreateDropdown(true);
                          onStartAccountCreation().then(
                            (data: AccountCreationData) =>
                              setAccountCreationData(data)
                          );
                        }}
                      />
                      <Dropdown
                        isOpen={isCreateDropdownOpen}
                        onClose={() => closeAccountCreation()}
                        className="uik-account-selector__create_dropdown"
                      >
                        {accountCreationData ? (
                          <Form>
                            <Text type="title">{strings.create_account}</Text>
                            <Input
                              label={strings.name}
                              error={
                                submittedWithError && newName.length < 3
                                  ? strings.error_short_name
                                  : undefined
                              }
                              onInput={(e) => setNewName(e.target.value)}
                            />
                            <Input
                              label={strings.native_address}
                              value={accountCreationData.address}
                              disabled={true}
                            />
                            <Input
                              label={strings.generated_seed}
                              textarea
                              value={accountCreationData.seed}
                              disabled={true}
                            />
                            <div className="uik-account-selector__copy-seed">
                              <CopyButton
                                value={accountCreationData.seed}
                                notification={strings.seed_copied}
                                tooltip={strings.copy_to_clipboard}
                              />
                              <Text type="light">
                                {strings.copy_to_clipboard}
                              </Text>
                            </div>
                            <div className="uik-account-selector_disclaimer">
                              <Icon icon={faWarning} />
                              <Text>{strings.creation_disclaimer}</Text>
                            </div>
                            <Checkbox
                              label={strings.backup_confirmation}
                              value={seedSaved}
                              onChange={(e) => setSeedSaved(e)}
                            ></Checkbox>
                            <div className="uik-dropdown__dropdown-buttons">
                              <Button
                                text={strings.cancel}
                                onClick={() => closeAccountCreation()}
                              />
                              <Button
                                text={strings.create}
                                fill
                                onClick={() => onCreateClick()}
                              />
                            </div>
                          </Form>
                        ) : (
                          <Loading />
                        )}
                      </Dropdown>
                    </>
                  )}

                  {onImport && (
                    <>
                      <Button
                        text={strings.import_account}
                        size="large"
                        onClick={() => setImportDropdown(true)}
                      />
                      <Dropdown
                        isOpen={isImportDropdownOpen}
                        onClose={() => closeAccountImport()}
                        className="uik-account-selector__import_dropdown"
                      >
                        <Form>
                          <Text type="title">{strings.import_account}</Text>
                          {importState === ImportState.NONE ? (
                            <>
                              <Button
                                onClick={() => setImportState(ImportState.SEED)}
                              >
                                {strings.from_seed}
                              </Button>
                              <Button
                                onClick={() => setImportState(ImportState.JSON)}
                              >
                                {strings.from_json}
                              </Button>
                            </>
                          ) : (
                            <>
                              {importState === ImportState.SEED ? (
                                <>
                                  <Input
                                    label={strings.name}
                                    error={
                                      submittedWithError && newName.length < 3
                                        ? strings.error_short_name
                                        : undefined
                                    }
                                    onInput={(e) => setNewName(e.target.value)}
                                  />
                                  <Input
                                    label={strings.existing_seed}
                                    textarea
                                    error={
                                      submittedWithError && !validSeed()
                                        ? strings.error_seed
                                        : undefined
                                    }
                                    onInput={(e) =>
                                      setImportSeed(e.target.value)
                                    }
                                  />
                                </>
                              ) : (
                                <>
                                  <Label className="uik-label__tooltip">
                                    {strings.backup_json}
                                    <Tooltip text={strings.json_tooltip}>
                                      <Icon icon={faCircleInfo} />
                                    </Tooltip>
                                  </Label>
                                  <Input
                                    textarea
                                    rows={8}
                                    error={
                                      submittedWithError && !validJson()
                                        ? strings.error_json
                                        : undefined
                                    }
                                    onInput={(e) =>
                                      setImportJson(e.target.value)
                                    }
                                  />
                                  <Input
                                    label={strings.password}
                                    type="password"
                                    error={
                                      submittedWithError && !password.length
                                        ? strings.error_password_empty
                                        : undefined
                                    }
                                    onInput={(e) => setPassword(e.target.value)}
                                  />
                                </>
                              )}
                              <div className="uik-dropdown__dropdown-buttons">
                                <Button
                                  text={strings.cancel}
                                  onClick={() => closeAccountImport()}
                                />
                                <Button
                                  text={strings.import}
                                  fill
                                  onClick={() => onImportClick()}
                                />
                              </div>
                            </>
                          )}
                        </Form>
                      </Dropdown>
                    </>
                  )}

                  {onUpdateMetadata && !!selectedNetwork && (
                    <Button
                      text={strings.update_metadata}
                      size="large"
                      onClick={() => onUpdateMetadata(selectedNetwork)}
                    />
                  )}
                </div>
              )}

            <div className="uik-account-selector__accounts">
              {!!accounts &&
                !!accounts.length &&
                accounts.map((account, index) => (
                  <AccountComponent
                    key={index}
                    className="uik-account-selector__account"
                    name={account.name}
                    address={account.address}
                    evmAddress={account.evmAddress}
                    source={account.source}
                    isEvmClaimed={account.isEvmClaimed}
                    onSelect={() => select(account)}
                    onRename={
                      onRename
                        ? (newName) => onRename(account.address, newName)
                        : undefined
                    }
                    onExport={
                      onExport
                        ? (exportPassword) => onExport(account.address, exportPassword)
                        : undefined
                    }
                    onForget={
                      onForget ? () => onForget(account.address) : undefined
                    }
                    isSelected={isSelected(account)}
                    showOptions={
                      !!showSnapOptions &&
                      (!extensions || selectedExtension?.isSnap)
                    }
                  />
                ))}
            </div>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};

export default AccountSelector;
