export const IconWrapper = ({ children, size = '1.2em', viewBox = '0 0 256 256', ...props }) => (
    <svg
        height={size}
        width={size}
        viewBox={viewBox}
        fill='currentColor'
        aria-hidden='true'
        focusable='false'
        role='presentation'
        {...props}
    >
        {children}
    </svg>
);

export const CheckIcon = props => (
    <IconWrapper viewBox='0 0 78.369 78.369' {...props}>
        <path d='M78.049,19.015L29.458,67.606c-0.428,0.428-1.121,0.428-1.548,0L0.32,40.015c-0.427-0.426-0.427-1.119,0-1.547l6.704-6.704 c0.428-0.427,1.121-0.427,1.548,0l20.113,20.112l41.113-41.113c0.429-0.427,1.12-0.427,1.548,0l6.703,6.704 C78.477,17.894,78.477,18.586,78.049,19.015z' />
    </IconWrapper>
);

export const CompassNeedleIcon = props => (
    <IconWrapper viewBox='0 0 24 24' {...props}>
        <path
            d='M12 2L16 12H12V2Z'
            className='fill-red-500'
        />
        <path
            d='M12 2L8 12H12V2Z'
            className='fill-red-300'
        />
        <path
            d='M12 22L16 12H12V22Z'
            className='fill-muted-foreground'
        />
        <path
            d='M12 22L8 12H12V22Z'
            className='fill-border'
        />
    </IconWrapper>
);
