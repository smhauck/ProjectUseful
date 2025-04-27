#!ruby

# Recreate the Changelog page

# changelog_file = Rails.root.to_s + "/app/views/pages/changelog.html.erb"
changelog_file = "../app/views/pages/changelog.html.erb"

f = File.open(changelog_file, "w")
f.write("<h1>Changelog</h1>")
f.write("<pre>")
f.write(`git log --pretty=reference`)
f.write("</pre>")
f.close
