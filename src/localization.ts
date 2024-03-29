import * as Localization from 'expo-localization';


interface Messages {
    thesaurusSearchTitle: string
    thesaurusEmptyScreen: string
    thesaurus: string
    synonyms: string
    nothingFound: string
    collocationsSearchTitle: string
    collocations:string
    collocationsOf:string
    collocationsEmptyScreen: string
    randomWordTitle: string
    randomWord: string
    history: string
    info: string
    search: string
    word: string
    clearHistory: string;
    synonymsOf: string;
}

const MSGS_BY_LANGUAGE: {[locale: string]: Messages} = {
    en: {
        thesaurus: "Thesaurus",
        thesaurusSearchTitle: "Thesaurus search",
        thesaurusEmptyScreen: "A **synonym** is a word or phrase that means exactly or nearly the same as another word or phrase in the same language.",
        synonyms: "Synonyms",
        collocations: "Collocations",
        collocationsEmptyScreen: "A **collocation** is a series of words that co-occur more often than would be expected by chance.",
        randomWord: "Random word",
        info: "Info",
        collocationsSearchTitle: "Collocations search",
        randomWordTitle: "Random word",
        search: "Search",
        word: "Word",
        nothingFound: "Nothing found",
        history: "Search history",
        clearHistory: "Clear history",
        collocationsOf: "Collocations of",
        synonymsOf: "Synonyms of"
    },
    sl: {
        thesaurus: "Sopomenke",
        thesaurusSearchTitle: "Iskanje sopomenk",
        thesaurusEmptyScreen: "**Sopomenka** (sinonim) je beseda, ki ima skoraj enak pomen kot kaka druga beseda.",
        synonyms: "Sopomenke",
        collocations: "Kolokacije",
        collocationsEmptyScreen: "**Kolokacije** so besedne zveze, ki niso več naključne, ampak so kot take že ustaljene v jeziku.",
        randomWord: "Naključna beseda",
        info: "Info",
        collocationsSearchTitle: "Iskanje kolokacij",
        randomWordTitle: "Naključna beseda",
        search: "Iskanje",
        word: "Beseda",
        nothingFound: "Nič ni najdeno",
        history: "Zgodovina iskanja",
        clearHistory: "Izbriši vse",
        collocationsOf: "Kolokacije od",
        synonymsOf: "Sopomenke od"
    },
}

const language = `${Localization.locale}`.split("-")[0] || "en";
export const MESSAGES: Messages = MSGS_BY_LANGUAGE[language] || MSGS_BY_LANGUAGE["en"];