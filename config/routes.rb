Rails.application.routes.draw do
  root 'pages#index'

  get '/api/conferences', to: 'conferences#get'

  match '*path', to: 'pages#index', via: :all
  #get '*path', to: "application#fallback_index_html", constraints: ->(request) do
  #  !request.xhr? && request.format.html?
  #end
end
