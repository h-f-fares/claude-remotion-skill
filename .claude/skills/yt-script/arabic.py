"""arabic.py - shared Arabic support for the yt-* tools.

Arabic glues particles onto words ("والقناة" is "and the channel"), so a plain word-list lookup
misses most matches. stem() strips the common leading particles and the article before comparing.
Covers MSA plus the most common Egyptian / Levantine / Gulf spoken forms, since hooks are spoken.
"""
import re

ARABIC = re.compile(r"[؀-ۿ]")
TOKEN = re.compile(r"[^\W_]+(?:'[^\W_]+)?|[%$٪]")
DIACRITICS = re.compile(r"[ً-ْـ]")  # harakat + tatweel
PREFIX = re.compile(r"^(?:[وف])?(?:بال|لل|كال|ال|[بلك](?=ال))?")

def is_arabic(t): return len(ARABIC.findall(t)) > len(re.findall(r"[A-Za-z]", t))

def normalize(t):
    t = DIACRITICS.sub("", t)
    return t.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ى", "ي").replace("ة", "ه")

def tokens(t): return TOKEN.findall(normalize(t.lower()))

def stem(w):
    s = PREFIX.sub("", w)
    return s if len(s) >= 2 else w

def forms(w):
    # both, because a word can genuinely start with و or ف ("فشل", "وقت") and stripping breaks it
    return {w, stem(w)}

def hit(w, words): return bool(forms(w) & words)

def starts(w, prefixes): return any(f.startswith(prefixes) for f in forms(w))

def _set(words): return {normalize(w) for w in words.split()}

STOP = _set("في من على عن الى إلى و يا هذا هذه ذلك تلك هو هي هم انا أنا نحن ما لا لم لن قد كان كانت "
            "مع او أو ثم بعد عند كل بين التي الذي اللي ده دي دا هاد هيك كده كدا ان أن إن مش مو بس "
            "عشان علشان لان لأن كمان برضه يعني ايه شو اي أي كيف ليش ليه لماذا ماذا هل")
FILLER = _set("يعني طيب اه آه امم اممم ام اوكي أوكي خلاص ماشي يلا طب بجد فعلا حرفيا جدا اهلا أهلا "
              "مرحبا السلام عليكم اليوم فيديو قناه قناتي اشترك لايك")
VAGUE = _set("مذهل مذهله رهيب رهيبه خرافي خرافيه جنوني جنونيه ضخم هائل افضل أفضل احسن أحسن سري سر "
             "قوي ثوري اسطوري أسطوري مستحيل عظيم خطير نار")
YOU = _set("انت أنت انتي أنتي انتم أنتم انتو انتوا لك لكم عندك عندكم عليك عليكم نفسك نفسكم منك")
CURIOSITY = _set("لماذا ليش ليه كيف ازاي إزاي ماذا ايش إيش ايه إيه شو اي أي حتى لكن بس احد أحد محدش تقريبا "
                 "الا إلا السبب سبب فعلا حقيقه للاخر للآخر")
CLOSED = _set("لان لأن عشان علشان بسبب يعني")
# stems that start a stake word: تخسر / خسرت / خسارة, تضيع / ضياع, تفشل, توقف, قبل, أبدا, خطر, تكلفة
STAKE_PREFIXES = tuple(normalize(w) for w in
                       "خسر تخسر يخسر خسار ضيع تضيع ضياع فشل تفشل توقف تتوقف قبل ابدا أبدا خطر "
                       "تكلف يكلف كلف تموت موت مفلس ترك يترك تترك سيب تسيب "
                       # leaks: تتسرب / تسريب, and data "leaving" the machine (داتاك تخرج)
                       "تسرب تتسرب يتسرب تسريب متتسربش تخرج يخرج تطلع "
                       # Egyptian / Levantine present tense: بـ / هـ / عم in front of the verb
                       "بتخسر هتخسر بيخسر بتضيع هتضيع بتفشل هتفشل بتترك بتسيب".split())
# Latin words inside Arabic text are almost always named things: tools, products, acronyms
LATIN_NAME = re.compile(r"\b[A-Z][A-Za-z0-9]+\b")

def is_second_person(w):
    # "قناتك" (your channel), "عندكم": the second-person suffix, on words long enough not to be a root
    return hit(w, YOU) or (len(w) >= 4 and not w.startswith("ال") and (w.endswith("ك") or w.endswith("كم")))
