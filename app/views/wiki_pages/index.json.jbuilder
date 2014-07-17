json.array!(@wiki_pages) do |wiki_page|
  json.extract! wiki_page, :id, :title, :body, :version, :Product_id, :Project_id, :Story_id, :Task_id, :User_id
  json.url wiki_page_url(wiki_page, format: :json)
end
