Rails.application.routes.draw do
  get '/api/conferences', to: 'conferences#get'

  get '*path', to: "application#fallback_index_html", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
