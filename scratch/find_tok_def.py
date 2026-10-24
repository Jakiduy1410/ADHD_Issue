with open('app/js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function tokenizeSentenceForHighlight')
print(text[pos:pos+1500])
