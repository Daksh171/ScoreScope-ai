import { useEffect, useState } from 'react';

export default function useMediaQuery(query) {
    const getInitial = () => {
        if (typeof window === 'undefined') return false;
        if (!window.matchMedia) return false;
        return window.matchMedia(query).matches;
    };

    const [matches, setMatches] = useState(getInitial);

    useEffect(() => {
        if (!window.matchMedia) return;
        const mql = window.matchMedia(query);

        const onChange = (e) => {
            setMatches(e.matches);
        };

        if (mql.addEventListener) {
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        }

        // Safari < 14 fallback
        mql.addListener(onChange);
        return () => mql.removeListener(onChange);
    }, [query]);

    return matches;
}

