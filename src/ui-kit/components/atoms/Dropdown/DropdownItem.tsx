import Icon from './../Icon';

export interface Props {
  text?: string,
  icon?: any,
  isDarkMode?:boolean,
  onClick?: (...args: any[]) => any,
  className?: string,
  children?: any
}

const DropdownItem = ({
  text,
  icon,
  onClick,
  isDarkMode,
  children,
  className
}: Props): JSX.Element => (
  <button
    className={`
      uik-dropdown__item
      ${className || ''}
    `}
    onClick={onClick}
    type='button'
  >
    {
      !!icon &&
      <div className="uik-dropdown__item-icon">           
        <Icon
          className='uik-button__icon'
          icon={icon}
        />
      </div>
    }
    <span className={`uik-dropdown__item-text ${isDarkMode?'dark':''}`}>{children}{text}</span>
  </button>
);

export default DropdownItem