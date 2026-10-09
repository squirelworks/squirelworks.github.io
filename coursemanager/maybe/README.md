The viewer is viewer.html. It loads systemshell, then reads lessonshells/catalog.json.

systemshell is the system books: base, recs, test, trnr, and the tb80r stub. A lesson send goes there. The modules do not parse a TBK.

lessonshells holds one JSON per lesson. The course list is whatever catalog.json names. Add a shell by writing lessonshells/<id>.json and a course row.

Serve the folder. Opening viewer.html as a file cannot fetch the catalog.
