# https://www.geeksforgeeks.org/nlp/nlp-part-of-speech-default-tagging/

import nltk
from nltk.tokenize import word_tokenize
from nltk import pos_tag
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger_eng')
import rich
text = """
In 1612, a Hindu kingdom under the Wodeyars emerged in the region of Mysore.
Chikka Krishnaraja Wodeyar II ruled from 1734 to 1766.
Haider Ali who was appointed as a soldier in the army of Wodeyars became the de-facto ruler of Mysore with his great administrative skills and military tactics.
During the second half of the 18th century, Mysore emerged as a formidable power under his leadership.
Mysore’s proximity with the French and Haidar Ali’s control over the rich trade of the Malabar coast threatened the political and commercial interests of the English and their control over Madras.
The British, after their success in the Battle of Buxar with the nawab of Bengal, signed a treaty with the Nizam of Hyderabad persuading him to give them the Northern Circars for protecting the Nizam from Haidar Ali who already had disputes with the Marathas.
The Nizam of Hyderabad, the Marathas, and the English allied together against Haidar Ali.
Haider diplomatically turned the Marathas neutral and Nizam into his ally against Nawab of Arcot.
The war continued for a year-and-a-half without any conclusion.
Haidar changed his strategy and suddenly appeared before the gates of Madras causing complete chaos and panic at Madras.
This forced the English to conclude a treaty with Haidar on April 4, 1769 known as the Treaty of Madras.
The treaty provided for the exchange of prisoners and the conquered areas.
Haidar Ali was promised the help of the English in case he was attacked by any other power.
"""
words = word_tokenize(text)
pos_tags = pos_tag(words)
print("\nPoS Tagging Result:")
for word, pos_tag in pos_tags:
    rich.print(f"{word}: [blue]{pos_tag}[/blue]",end=" ")