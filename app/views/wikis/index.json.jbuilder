json.array!(@wikis) do |wiki|
  json.extract! wiki, :id, :title, :description
  json.url wiki_url(wiki, format: :json)
end
